import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getCollectionSource } from '@/web/core/dataset/api';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useTranslation } from 'next-i18next';

export function getCollectionSourceAndOpen(collectionId: string, sourceName?: string) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setLoading } = useSystemStore();

  return async () => {
    try {
      setLoading(true);
      const { value: url } = await getCollectionSource(collectionId);

      if (!url) {
        throw new Error('No file found');
      }

      // 获得完整文件读取链接
      const fileUrl = url.startsWith('/') ? `${location.origin}${url}` : url;

      // 获取文件内容
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();

      // 构建文件下载内容
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      // 构建文件名
      const filename = sourceName || 'downloaded_file.md';
      link.download = filename;

      // 执行文件下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // if (url.startsWith('/')) {
      //   window.open(`${location.origin}${url}`, '_blank');
      // } else {
      //   window.open(url, '_blank');
      // }
    } catch (error) {
      toast({
        title: getErrText(error, t('common:error.fileNotFound')),
        status: 'error'
      });
    }
    setLoading(false);
  };
}
