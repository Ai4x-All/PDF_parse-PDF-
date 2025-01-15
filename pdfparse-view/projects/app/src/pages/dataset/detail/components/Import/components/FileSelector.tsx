import MyBox from '@fastgpt/web/components/common/MyBox';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { Box, FlexProps } from '@chakra-ui/react';
import { formatFileSize } from '@fastgpt/global/common/file/tools';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import React, { DragEvent, useCallback, useMemo, useState } from 'react';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { getFileIcon } from '@fastgpt/global/common/file/icon';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { uploadFile2DB } from '@/web/common/file/controller';
import { BucketNameEnum } from '@fastgpt/global/common/file/constants';
import { ImportSourceItemType } from '@/web/core/dataset/type';
import { useI18n } from '@/web/context/I18n';
import axios from 'axios';
import { useContextSelector } from 'use-context-selector';
import { DatasetImportContext } from '../Context';
export type SelectFileItemType = {
  fileId: string;
  folderPath: string;
  file: File;
};

const FileSelector = ({
  fileType,
  selectFiles,
  setSelectFiles,
  onStartSelect,
  onFinishSelect,
  ...props
}: {
  fileType: string;
  selectFiles: ImportSourceItemType[];
  setSelectFiles: React.Dispatch<React.SetStateAction<ImportSourceItemType[]>>;
  onStartSelect: () => void;
  onFinishSelect: () => void;
} & FlexProps) => {
  const { t } = useTranslation();
  const { fileT } = useI18n();

  const { toast } = useToast();
  const { feConfigs } = useSystemStore();

  const maxCount = feConfigs?.uploadFileMaxAmount || 1000;
  const maxSize = (feConfigs?.uploadFileMaxSize || 1024) * 1024 * 1024;
  const {previewUrl, setPreviewUrl,setpdfResponse,pdfresponse} = useContextSelector(DatasetImportContext, (c) => c);
  const { File, onOpen } = useSelectFile({
    fileType,
    multiple: true,
    maxCount
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 新增状态，控制上传中状态
  const isMaxSelected = useMemo(
    () => selectFiles?.length >= maxCount,
    [maxCount, selectFiles?.length]
  );

  const filterTypeReg = new RegExp(
    `(${fileType
      ?.split(',')
      .map((item:any) => item.trim())
      .join('|')})$`,
    'i'
  );








  async function convertPdfToMd(file: File): Promise<string> {
    try {
      // 1. 上传 PDF 文件并启动解析任务
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', 'chat');
      const startResponse = await fetch('https://www.xiaoruiai.com:8203/parse_pdf', {
        method: 'POST',
        body: formData
      });
  
      const startData = await startResponse.json();
      console.log('startResponse111', startData);
  
      if (!startResponse.ok) {
        throw new Error('Failed to start PDF parsing');
      }
  
      const getServermarkdownRes = async (data: any) => {
        try {
          const mdresponse = await axios({
            method: 'get',
            url: 'https://www.xiaoruiai.com:8203/download_md',
            params: { file_name: data.file_name }
          });
          let mdstr = mdresponse.data;
          return mdstr;
  
        } catch (error) {
          console.error('Error fetching data:', error);
          throw error;
        }
      };

      // console.log('cookie', localStorage.getItem('token'));

      
      
      // 参照的接口
      const resp = await axios({
        method: 'post',
        url: '/api/common/file/upload',
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Cookie': `fastgpt_token=${localStorage.getItem('fastgpt_token')}`,
        },
        data: formData 
      });
      console.log('上传结果ceshi', resp.data.data.previewUrl,'---',resp.data);
      
      setPreviewUrl((prev) => {
        return[
          ...prev,
          {
            name:startData.file_name,
            url: resp.data.data.previewUrl,
            id:startData.id
          }
        ]
      })
      console.log('上传结果', resp.data);
      let intervalId:any;
      const checkStatus = async () => {
        try {
          const statusResponse = await axios({
            method: 'get',
            url: 'https://www.xiaoruiai.com:8203/parse_result',
            params: { parse_id: startData.id }
          });
          console.log('statusResponse', statusResponse.data);
  
          if (statusResponse.data.status === 'completed') {
            console.log('此刻的状态',resp.data.data.previewUrl );
            
            clearInterval(intervalId);
            const markdown = await getServermarkdownRes(statusResponse.data);
            console.log('markdown', markdown);
            setpdfResponse((prev:any) => {
              return[
                ...prev,
                {
                  name:startData.file_name,
                  url: resp.data.data.previewUrl,
                  id:startData.id,
                  markdown:markdown,
                }
              ]
            });

            return markdown; // 直接返回 markdown
          } else {
            console.log('Status:', statusResponse.data.status);
          }
        } catch (error) {
          console.error('Error checking status:', error);
          throw error;
        }
      };
  
      return new Promise((resolve, reject) => {
        intervalId = setInterval(async () => {
          try {
            const markdown = await checkStatus();
            if (markdown) {
              resolve(markdown); // 如果有 markdown，resolve 它
            }
          } catch (error) {
            reject(error);
          }
        }, 1000);
      });
  
    } catch (error) {
      console.error('Error converting PDF to MD:', error);
      throw error;
    }
  }
















  const { mutate: onSelectFile, isLoading } = useRequest({
    mutationFn: async (files: SelectFileItemType[]) => {
        onStartSelect();
        setSelectFiles((state:any) => {
          const formatFiles = files.map<ImportSourceItemType>((selectFile) => {
            const { fileId, file } = selectFile;

            return {
              id: fileId,
              createStatus: 'waiting',
              file,
              sourceName: file.name,
              sourceSize: formatFileSize(file.size),
              icon: getFileIcon(file.name),
              isUploading: true,
              uploadedFileRate: 0
            };
          });
          const results = formatFiles.concat(state).slice(0, maxCount);
          return results;
        });
        setIsUploading(true); // 设置上传状态为 true
        try {
          // 筛选出 PDF 文件
          const pdfFiles = files.filter((file) =>
            file.file.name.toLowerCase().endsWith('.pdf')
          );
          // 筛选出非 PDF 文件（直接排除 PDF 文件）
          const nonPdfFiles = files.filter((file) => !file.file.name.toLowerCase().endsWith('.pdf'));

          // 上传普通文件（非 PDF 文件）
          const uploadPromises = nonPdfFiles.map(async ({ fileId, file }) => {
            const { fileId: uploadFileId } = await uploadFile2DB({
              file,
              bucketName: BucketNameEnum.dataset,
              percentListen: (e) => {
                setSelectFiles((state:any) =>
                  state.map((item:any) =>
                    item.id === fileId
                      ? {
                          ...item,
                          uploadedFileRate: item.uploadedFileRate
                            ? Math.max(e, item.uploadedFileRate)
                            : e
                        }
                      : item
                  )
                );
              }
            });
            setSelectFiles((state:any) =>
              state.map((item:any) =>
                item.id === fileId
                  ? {
                      ...item,
                      dbFileId: uploadFileId,
                      isUploading: false,
                      uploadedFileRate: 100
                    }
                  : item
              )
            );
          });
          // 处理 PDF 文件
          const pdfPromises = pdfFiles.map(async ({ fileId, file }) => {
            try {
              // 调用 PDF 转 MD 接口
              const mdContent = await convertPdfToMd(file);

              // 创建临时 MD 文件
              const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
              
              // 通过 window 获取原生的 File 构造函数
              const FileConstructor = window.File; 
              const mdFile = new FileConstructor([mdBlob], file.name.replace(/\.pdf$/, '.md'), {
                type: 'text/markdown'
              });

              // 上传 MD 文件
              const { fileId: uploadFileId } = await uploadFile2DB({
                file: mdFile,
                bucketName: BucketNameEnum.dataset,
                percentListen: (e) => {
                  setSelectFiles((state :any) =>
                    state.map((item:any) =>
                      item.id === fileId
                        ? {
                            ...item,
                            uploadedFileRate: item.uploadedFileRate
                              ? Math.max(e, item.uploadedFileRate)
                              : e
                          }
                        : item
                    )
                  );
                }
              });

              setSelectFiles((state:any) =>
                state.map((item:any) =>
                  item.id === fileId
                    ? {
                        ...item,
                        dbFileId: uploadFileId,
                        isUploading: false,
                        uploadedFileRate: 100
                      }
                    : item
                )
              );
            } catch (error) {
              console.error('PDF 转 MD 失败', error);
              toast({
                title: fileT('pdf_to_md_failed'),
                status: 'error'
              });
            }
          });
    
          // 等待所有文件处理完成
          await Promise.all([...uploadPromises, ...pdfPromises]);
        } catch (error) {
          console.log(error);
        } finally {
          setIsUploading(false); // 上传完成后，恢复上传状态
        }
        onFinishSelect();
      }
    });

  const selectFileCallback = useCallback(
    (files: SelectFileItemType[]) => {
      if (selectFiles?.length + files?.length > maxCount) {
        files = files.slice(0, maxCount - selectFiles?.length);
        toast({
          status: 'warning',
          title: fileT('some_file_count_exceeds_limit', { maxCount })
        });
      }
      // size check
      if (!maxSize) {
        return onSelectFile(files);
      }
      const filterFiles = files.filter((item) => item.file.size <= maxSize);

      if (filterFiles?.length < files?.length) {
        toast({
          status: 'warning',
          title: fileT('some_file_size_exceeds_limit', { maxSize: formatFileSize(maxSize) })
        });
      }

      return onSelectFile(filterFiles);
    },
    [fileT, maxCount, maxSize, onSelectFile, selectFiles?.length, toast]
  );

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const fileList: SelectFileItemType[] = [];

    const firstEntry = items[0].webkitGetAsEntry();

    if (firstEntry?.isDirectory && items?.length === 1) {
      {
        const readFile = (entry: any) => {
          return new Promise((resolve) => {
            entry.file((file: File) => {
              const folderPath = (entry.fullPath || '')?.split('/').slice(2, -1).join('/');

              if (filterTypeReg.test(file.name)) {
                fileList.push({
                  fileId: getNanoid(),
                  folderPath,
                  file
                });
              }
              resolve(file);
            });
          });
        };
        const traverseFileTree = (dirReader: any) => {
          return new Promise((resolve) => {
            let fileNum = 0;
            dirReader.readEntries(async (entries: any[]) => {
              for await (const entry of entries) {
                if (entry.isFile) {
                  await readFile(entry);
                  fileNum++;
                } else if (entry.isDirectory) {
                  await traverseFileTree(entry.createReader());
                }
              }

              // chrome: readEntries will return 100 entries at most
              if (fileNum === 100) {
                await traverseFileTree(dirReader);
              }
              resolve('');
            });
          });
        };

        for await (const item of items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isFile) {
              await readFile(entry);
            } else if (entry.isDirectory) {
              //@ts-ignore
              await traverseFileTree(entry.createReader());
            }
          }
        }
      }
    } else if (firstEntry?.isFile) {
      const files = Array.from(e.dataTransfer.files);
      let isErr = files.some((item) => item.type === '');
      if (isErr) {
        return toast({
          title: t('file:upload_error_description'),
          status: 'error'
        });
      }

      fileList.push(
        ...files
          .filter((item) => filterTypeReg.test(item.name))
          .map((file) => ({
            fileId: getNanoid(),
            folderPath: '',
            file
          }))
      );
    } else {
      return toast({
        title: fileT('upload_error_description'),
        status: 'error'
      });
    }

    selectFileCallback(fileList.slice(0, maxCount));
  };

  return (
    <MyBox
      isLoading={isLoading}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      px={3}
      py={[4, 7]}
      borderWidth={'1.5px'}
      borderStyle={'dashed'}
      borderRadius={'md'}
      {...(isMaxSelected
        ? {}
        : {
            cursor: 'pointer',
            _hover: {
              bg: 'primary.50',
              borderColor: 'primary.600'
            },
            borderColor: isDragging ? 'primary.600' : 'borderColor.high',
            onDragEnter: handleDragEnter,
            onDragOver: (e:any) => e.preventDefault(),
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onClick: onOpen
          })}
      {...props}
    >
      <MyIcon name={'common/uploadFileFill'} w={'32px'} />
      {isMaxSelected || isUploading ? (
        <>
          <Box color={'myGray.500'} fontSize={'xs'}>
            {t('file:reached_max_file_count')}
          </Box>
        </>
      ) : (
        <>
          <Box fontWeight={'bold'}>
            {isDragging
              ? fileT('release_the_mouse_to_upload_the_file')
              : fileT('select_and_drag_file_tip')}
          </Box>
          {/* file type */}
          <Box color={'myGray.500'} fontSize={'xs'}>
            {fileT('support_file_type', { fileType })}
          </Box>
          <Box color={'myGray.500'} fontSize={'xs'}>
            {/* max count */}
            {maxCount && fileT('support_max_count', { maxCount })}
            {/* max size */}
            {maxSize && fileT('support_max_size', { maxSize: formatFileSize(maxSize) })}
          </Box>

          <File
            onSelect={(files) =>
              selectFileCallback(
                files.map((file) => ({
                  fileId: getNanoid(),
                  folderPath: '',
                  file
                }))
              )
            }
          />
        </>
      )}
    </MyBox>
  );
};

export default React.memo(FileSelector);
