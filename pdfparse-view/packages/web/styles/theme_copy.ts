import { extendTheme, defineStyleConfig, ComponentStyleConfig } from '@chakra-ui/react';
import {
  modalAnatomy,
  switchAnatomy,
  selectAnatomy,
  numberInputAnatomy,
  checkboxAnatomy,
  tableAnatomy,
  radioAnatomy
} from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/styled-system';

const { definePartsStyle: modalPart, defineMultiStyleConfig: modalMultiStyle } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);
const { definePartsStyle: switchPart, defineMultiStyleConfig: switchMultiStyle } =
  createMultiStyleConfigHelpers(switchAnatomy.keys);
const { definePartsStyle: selectPart, defineMultiStyleConfig: selectMultiStyle } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);
const { definePartsStyle: numInputPart, defineMultiStyleConfig: numInputMultiStyle } =
  createMultiStyleConfigHelpers(numberInputAnatomy.keys);
const { definePartsStyle: checkBoxPart, defineMultiStyleConfig: checkBoxMultiStyle } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);
const { definePartsStyle: tablePart, defineMultiStyleConfig: tableMultiStyle } =
  createMultiStyleConfigHelpers(tableAnatomy.keys);
const { definePartsStyle: radioParts, defineMultiStyleConfig: radioStyle } =
  createMultiStyleConfigHelpers(radioAnatomy.keys);

const shadowLight = '0px 0px 0px 2.4px rgba(51, 112, 255, 0.15)';

const customInputStyles = {  
  field: {  
    borderRadius: '8px', // 自定义边框圆角  
    bg: 'white', // 自定义背景色  
    borderColor: 'gray.300', // 自定义边框颜色  
    _focus: {  
      borderColor: 'blue.500', // 自定义聚焦时的边框颜色  
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)', // 自定义聚焦时的阴影  
    },  
    _placeholder: {  
      color: 'gray.500', // 自定义占位符颜色  
    },  
    _disabled: {  
      bg: 'gray.200', // 自定义禁用时的背景色  
      opacity: 0.5,  
      cursor: 'not-allowed',  
    },  
    _invalid: {  
      borderColor: 'red.500', // 自定义验证失败时的边框颜色  
    },  
  },  
};  

// 按键
const Button = defineStyleConfig({
  baseStyle: {
    _active: {
      transform: 'scale(0.98)'
    },
    _disabled: {
      _hover: {
        filter: 'none'
      }
    }
  },
  sizes: {
    xs: {
      fontSize: 'xs',
      px: '2',
      py: '0',
      h: '24px',
      fontWeight: 'normal',
      borderRadius: 'sm'
    },
    xsSquare: {
      fontSize: 'xs',
      px: '0',
      py: '0',
      h: '24px',
      w: '24px',
      fontWeight: 'normal',
      borderRadius: 'sm'
    },
    sm: {
      fontSize: 'sm',
      px: '3',
      py: 0,
      fontWeight: 'normal',
      h: '30px',
      borderRadius: 'sm'
    },
    smSquare: {
      fontSize: 'sm',
      px: '0',
      py: 0,
      fontWeight: 'normal',
      h: '30px',
      w: '30px',
      borderRadius: 'sm'
    },
    md: {
      fontSize: 'sm',
      px: '4',
      py: 0,
      h: '34px',
      fontWeight: 'normal',
      borderRadius: 'md'
    },
    mdSquare: {
      fontSize: 'sm',
      px: '0',
      py: 0,
      h: '34px',
      w: '34px',
      fontWeight: 'normal',
      borderRadius: 'md'
    },
    lg: {
      fontSize: 'md',
      px: '4',
      py: 0,
      h: '40px',
      fontWeight: 'normal',
      borderRadius: 'lg'
    },
    lgSquare: {
      fontSize: 'md',
      px: '0',
      py: 0,
      h: '40px',
      w: '40px',
      fontWeight: 'normal',
      borderRadius: 'lg'
    }
  },
  variants: {
    primary: {
      bg: 'primary.400',
      color: 'white',
      border: 'none',
      boxShadow: '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)',
      _hover: {
        filter: 'brightness(120%)'
      },
      _disabled: {
        bg: 'primary.7 !important'
      }
    },
    primaryOutline: {
      color: 'primary.600',
      border: '1px solid',
      borderColor: 'primary.300',
      bg: 'white',
      transition: 'background 0.1s',
      boxShadow: '1',
      _hover: {
        bg: 'primary.1'
      },
      _active: {
        color: 'primary.600'
      },
      _disabled: {
        bg: 'white !important'
      }
    },
    primaryGhost: {
      color: 'primary.600',
      border: '1px solid',
      borderColor: 'primary.300',
      bg: 'primary.50',
      transition: 'background 0.1s',
      boxShadow: '1',
      _hover: {
        bg: 'primary.600',
        color: 'white',
        borderColor: 'primary.600'
      },
      _disabled: {
        color: 'primary.600 !important',
        bg: 'primary.50 !important',
        borderColor: 'primary.300 !important'
      }
    },
    whiteBase: {
      color: 'myGray.600',
      border: '1px solid',
      borderColor: 'myGray.250',
      bg: 'white',
      transition: 'background 0.1s',
      boxShadow: '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)',
      _hover: {
        color: 'primary.600'
      },
      _active: {
        color: 'primary.600'
      },
      _disabled: {
        color: 'myGray.600 !important'
      }
    },
    whitePrimary: {
      color: 'myGray.600',
      border: '1px solid',
      borderColor: 'myGray.250',
      bg: 'white',
      transition: 'background 0.1s',
      boxShadow: '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)',
      _hover: {
        color: 'primary.600',
        background: 'primary.1',
        borderColor: 'primary.300'
      },
      _active: {
        color: 'primary.600'
      },
      _disabled: {
        color: 'myGray.600 !important'
      }
    },
    whiteFlow: {
      color: 'myGray.600',
      border: '1px solid',
      borderColor: 'myGray.200',
      height: '40px',
      bg: 'white',
      px: '12px',
      py: '0',
      borderRadius: '6px',
      transition: 'background 0.1s',
      _hover: {
        color: 'primary.600',
        background: 'primary.1',
        borderColor: 'primary.300'
      },
      _active: {
        color: 'primary.600'
      },
      _disabled: {
        color: 'myGray.600 !important'
      }
    },
    whiteDanger: {
      color: 'myGray.600',
      border: '1px solid',
      borderColor: 'myGray.250',
      bg: 'white',
      transition: 'background 0.1s',
      boxShadow: '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)',
      _hover: {
        color: 'red.600',
        background: 'red.1',
        borderColor: 'red.300'
      },
      _active: {
        color: 'red.600'
      }
    },
    grayBase: {
      bg: 'myGray.150',
      color: 'myGray.900',
      _hover: {
        color: 'primary.600',
        bg: 'primary.50'
      },
      _disabled: {
        bg: 'myGray.50 !important'
      }
    },
    grayDanger: {
      bg: 'myGray.150',
      color: 'myGray.900',
      _hover: {
        color: 'red.600',
        background: 'red.1',
        borderColor: 'red.300'
      },
      _active: {
        color: 'red.600'
      }
    },
    transparentBase: {
      color: 'myGray.800',
      fontWeight: '500',
      bg: 'transparent',
      transition: 'background 0.1s',
      _hover: {
        bg: 'myGray.150'
      },
      _active: {
        bg: 'myGray.150'
      },
      _disabled: {
        color: 'myGray.800 !important'
      }
    },
    transparentDanger: {
      color: 'myGray.800',
      fontWeight: '500',
      bg: 'transparent',
      transition: 'background 0.1s',
      _hover: {
        bg: 'myGray.150',
        color: 'red.600'
      },
      _active: {
        bg: 'myGray.150'
      },
      _disabled: {
        color: 'myGray.800 !important'
      }
    },
    dangerFill: {
      bg: 'red.600',
      color: 'white',
      border: 'none',
      boxShadow: '0px 0px 1px 0px rgba(19, 51, 107, 0.08), 0px 1px 2px 0px rgba(19, 51, 107, 0.05)',
      _hover: {
        filter: 'brightness(120%)'
      },
      _disabled: {
        bg: 'red.200 !important'
      }
    }
  },
  defaultProps: {
    size: 'md',
    variant: 'primary'
  }
});

const Input: ComponentStyleConfig = {
  sizes: {
    sm: defineStyle({
      field: {
        h: '32px',
        borderRadius: 'md'
      }
    }),
    md: defineStyle({
      field: {
        h: '34px',
        borderRadius: 'md'
      }
    })
  },
  variants: {
    outline: {
      field: {
        border: '1px solid',
        borderColor: 'borderColor.low',
        _focus: {
          borderColor: 'primary.500',
          boxShadow: shadowLight,
          bg: 'white'
        },
        _disabled: {
          color: 'myGray.400',
          bg: 'myWhite.300'
        }
      }
    }
  },
  defaultProps: {
    size: 'md',
    variant: 'outline'
  }
};

const NumberInput = numInputMultiStyle({
  sizes: {
    sm: defineStyle({
      field: {
        h: '32px',
        borderRadius: 'md',
        fontsize: 'sm'
      }
    }),
    md: defineStyle({
      field: {
        h: '40px',
        borderRadius: 'md',
        fontsize: 'sm'
      }
    })
  },
  variants: {
    outline: numInputPart({
      field: {
        bg: 'myGray.50',
        border: '1px solid',
        borderColor: 'myGray.200',
        _focus: {
          borderColor: 'primary.500 !important',
          boxShadow: `${shadowLight} !important`,
          bg: 'transparent'
        },
        _disabled: {
          color: 'myGray.400 !important',
          bg: 'myWhite.300 !important'
        }
      },
      stepper: {
        bg: 'transparent',
        border: 'none',
        color: 'myGray.600',
        _active: {
          color: 'primary.500'
        }
      }
    })
  },
  defaultProps: {
    variant: 'outline'
  }
});

const Textarea: ComponentStyleConfig = {
  variants: {
    outline: {
      border: '1px solid',
      borderRadius: 'md',
      borderColor: 'myGray.200',
      fontSize: 'sm',
      _hover: {
        borderColor: ''
      },
      _focus: {
        borderColor: 'primary.500',
        boxShadow: shadowLight,
        bg: 'white'
      }
    }
  },

  defaultProps: {
    size: 'md',
    variant: 'outline'
  }
};

const Switch = switchMultiStyle({
  baseStyle: switchPart({
    track: {
      bg: 'myGray.100',
      borderWidth: '1px',
      borderColor: 'borders.base',
      _checked: {
        bg: 'primary.600'
      }
    }
  }),
  defaultProps: {
    size: 'md'
  }
});

const Select = selectMultiStyle({
  variants: {
    outline: selectPart({
      field: {
        borderColor: 'myGray.200',
        _focusWithin: {
          boxShadow: shadowLight,
          borderColor: 'primary.500'
        }
      }
    })
  }
});

const Radio = radioStyle({
  baseStyle: radioParts({
    control: {
      _hover: {
        borderColor: 'primary.300',
        bg: 'primary.50'
      },
      _checked: {
        borderColor: 'primary.600',
        bg: 'primary.50',
        boxShadow: shadowLight,
        _before: {
          bg: 'primary.600'
        },
        _hover: {
          bg: 'primary.50'
        }
      }
    }
  })
});
const Checkbox = checkBoxMultiStyle({
  baseStyle: checkBoxPart({
    label: {
      fontFamily: '"Noto Serif SC", serif' // change the font family of the label
    },
    control: {
      borderRadius: 'xs',
      bg: 'none',
      _checked: {
        bg: 'primary.50',
        borderColor: 'primary.600',
        color: 'primary.600',
        boxShadow: `${shadowLight} !important`,
        _hover: {
          bg: 'primary.50'
        }
      },
      _hover: {
        borderColor: 'primary.400'
      }
    }
  })
});

const Modal = modalMultiStyle({
  baseStyle: modalPart({
    body: {
      py: 4,
      px: 7
    },
    footer: {
      pt: 2
    }
  })
});

const Table = tableMultiStyle({
  sizes: {
    md: defineStyle({
      table: {
        fontsize: 'sm'
      },
      thead: {
        tr: {
          bg: 'myGray.100',
          fontSize: 'sm',
          th: {
            borderBottom: 'none',
            overflow: 'hidden',
            '&:first-of-type': {
              borderLeftRadius: 'md'
            },
            '&:last-of-type': {
              borderRightRadius: 'md'
            }
          }
        }
      },
      tbody: {
        tr: {
          td: {
            overflow: 'hidden',
            '&:first-of-type': {
              borderLeftRadius: 'md'
            },
            '&:last-of-type': {
              borderRightRadius: 'md'
            }
          }
        }
      }
    })
  },
  defaultProps: {
    size: 'md'
  }
});

// 全局主题
export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'myGray.600',
        fontWeight: 'normal',
        height: '100%',
        overflow: 'hidden',
        fontSize: '16px',
        fontFamily: '"微软雅黑", "Microsoft YaHei", sans-serif', // 设置全局字体
      },
      '*': {
        fontFamily: '"微软雅黑", "Microsoft YaHei", sans-serif', // 设置全局字体
        _focusVisible: {
          boxShadow: 'none'
        }
      },
      a: {
        color: 'primary.600'
      }
    }
  },
  colors: {
    myBg:{
      100: "linear-gradient(135deg, rgba(220, 230, 255, 1), rgba(200, 210, 255, 1), rgba(180, 190, 255, 0.9))", //大的背景色
      200: "linear-gradient(130deg, rgba(242, 246, 255, 1) 0%, rgba(220, 228, 255, 0.7) 40%, rgba(250, 210, 230, 0.6) 90%, rgba(222, 200, 255, 0.6) 100%)", //左侧导航栏色调
      300: "linear-gradient(168deg, #F5F7FA 0%, rgba(220, 228, 255, 1) 70%, rgba(240, 236, 255, 1) 100%);", //首页工作流、知识库卡片样式
      400: "linear-gradient(120deg, #F5F7FA 0%, rgba(220, 228, 255, 1) 60%, rgba(250, 236, 255, 0.9) 100%);", //工作流小圆圈模块窗背景样式 
      500: "linear-gradient(120deg, #F5F7FA 0%, rgba(190, 205, 240, 1) 50%, rgba(165, 185, 235, 1) 100%)", //右侧模块窗样式 
      600: "linear-gradient(120deg, rgba(220, 227, 242), rgba(200, 210, 240), rgba(200, 210, 255, 1), rgba(225, 221, 226));", //工作流内部背景
      // 700: "linear-gradient(135deg, #E0E6EF, #F2F4F6);",
      700: "linear-gradient(145deg,#F5F7FA 0%, rgba(220, 228, 255, 1) 60%,rgba(240, 236, 255, 1) 90%, rgba(235, 230, 239) 100%);"


    },
    myWhite: {
      100: '#FEFEFE',
      200: '#FDFDFE',
      300: '#FBFBFC',
      400: '#F8FAFB',
      500: '#F6F8F9',
      600: '#F4F6F8',
      700: '#C3C5C6',
      800: '#929495',
      900: '#626263',
      1000: '#313132'
    },
    myGray: {
      '05': 'rgba(17, 24, 36, 0.05)',
      1: 'rgba(17, 24, 36, 0.1)',
      15: 'rgba(17, 24, 36, 0.15)',

      25: '#FBFBFC',
      50: '#F7F8FA',
      100: '#F4F4F7',
      150: '#F0F1F6',
      200: '#E8EBF0',
      250: '#DFE2EA',
      300: '#C4CBD7',
      400: '#8A95A7',
      500: '#667085',
      600: '#485264',
      700: '#383F50',
      800: '#1D2532',
      900: '#111824'
    },
    primary: {
      1: 'rgba(51, 112, 255, 0.1)',
      '015': 'rgba(51, 112, 255, 0.15)',
      3: 'rgba(51, 112, 255, 0.3)',
      5: 'rgba(51, 112, 255, 0.5)',
      7: 'rgba(51, 112, 255, 0.7)',
      9: 'rgba(51, 112, 255, 0.9)',

      50: '#F0F4FF',
      100: '#E1EAFF',
      200: '#C5D7FF',
      300: '#94B5FF',
      400: '#5E8FFF',
      500: '#487FFF',
      600: '#3370FF',
      700: '#2B5FD9',
      800: '#2450B5',
      900: '#1D4091'
    },
    blue: {
      1: 'rgba(51, 112, 255, 0.1)',
      '015': 'rgba(51, 112, 255, 0.15)',
      3: 'rgba(51, 112, 255, 0.3)',
      5: 'rgba(51, 112, 255, 0.5)',
      7: 'rgba(51, 112, 255, 0.7)',
      9: 'rgba(51, 112, 255, 0.9)',

      50: '#F0F4FF',
      100: '#E1EAFF',
      200: '#C5D7FF',
      300: '#94B5FF',
      400: '#5E8FFF',
      500: '#487FFF',
      600: '#3370FF',
      700: '#2B5FD9',
      800: '#2450B5',
      900: '#1D4091'
    },
    red: {
      1: 'rgba(217,45,32,0.1)',
      3: 'rgba(217,45,32,0.3)',
      5: 'rgba(217,45,32,0.5)',

      25: '#FFFBFA',
      50: '#FEF3F2',
      100: '#FEE4E2',
      200: '#FECDCA',
      300: '#FDA29B',
      400: '#F97066',
      500: '#F04438',
      600: '#D92D20',
      700: '#B42318',
      800: '#912018',
      900: '#7A271A'
    },
    green: {
      25: '#F9FEFB',
      50: '#EDFBF3',
      100: '#D1FADF',
      200: '#B9F4D1',
      300: '#76E4AA',
      400: '#32D583',
      500: '#12B76A',
      600: '#039855',
      700: '#027A48',
      800: '#05603A',
      900: '#054F31'
    },
    yellow: {
      25: '#FFFDFA',
      50: '#FFFAEB',
      100: '#FEF0C7',
      200: '#FEDF89',
      300: '#F5C149',
      400: '#FDB022',
      500: '#F79009',
      600: '#DC6803',
      700: '#B54708',
      800: '#93370D',
      900: '#7A2E0E'
    },
    borderColor: {
      low: '#E8EBF0',
      base: '#DFE2EA',
      high: '#C4CBD7',
      highest: '#8A95A7'
    }
  },
  fonts: {
    //body: '"微软雅黑",PingFang,Noto Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
    //heading: '"微软雅黑", PingFang, Noto Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    body: '"微软雅黑", "Microsoft YaHei", sans-serif',
  heading: '"微软雅黑", "Microsoft YaHei", sans-serif',
  },
  fontSizes: {
    mini: '0.75rem',
    xs: '0.8rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.75rem',
    '3xl': '2rem',
    '4xl': '2.25rem',
    '5xl': '2.8rem',
    '6xl': '3.6rem'
  },
  borders: {
    sm: '1px solid #E8EBF0',
    base: '1px solid #DFE2EA',
    md: '1px solid #DAE0E2',
    lg: '1px solid #D0E0E2'
  },
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  shadows: {
    1: '0px 1px 2px 0px rgba(19, 51, 107, 0.05), 0px 0px 1px 0px rgba(19, 51, 107, 0.08)',
    1.5: '0px 1px 2px 0px rgba(19, 51, 107, 0.10), 0px 0px 1px 0px rgba(19, 51, 107, 0.15)',
    2: '0px 4px 4px 0px rgba(19, 51, 107, 0.05), 0px 0px 1px 0px rgba(19, 51, 107, 0.08)',
    3: '0px 4px 10px 0px rgba(19, 51, 107, 0.08), 0px 0px 1px 0px rgba(19, 51, 107, 0.08)',
    3.5: '0px 4px 10px 0px rgba(19, 51, 107, 0.10), 0px 0px 1px 0px rgba(19, 51, 107, 0.10)',
    4: '0px 12px 16px -4px rgba(19, 51, 107, 0.20), 0px 0px 1px 0px rgba(19, 51, 107, 0.20)',
    5: '0px 20px 24px -8px rgba(19, 51, 107, 0.15), 0px 0px 1px 0px rgba(19, 51, 107, 0.15)',
    6: '0px 24px 48px -12px rgba(19, 51, 107, 0.20), 0px 0px 1px 0px rgba(19, 51, 107, 0.20)',
    7: '0px 32px 64px -12px rgba(19, 51, 107, 0.20), 0px 0px 1px 0px rgba(19, 51, 107, 0.20)',
    focus: shadowLight,
    outline: 'none'
  },
  breakpoints: {
    sm: '900px',
    md: '1200px',
    lg: '1500px',
    xl: '1800px',
    '2xl': '2100px'
  },
  lgColor: {
    activeBlueGradient: 'linear-gradient(to bottom right, #d6e8ff 0%, #f0f7ff 100%)',
    hoverBlueGradient: 'linear-gradient(to top left, #d6e8ff 0%, #f0f7ff 100%)',
    primary: 'linear-gradient(to bottom right, #2152d9 0%,#3370ff 40%, #4e83fd 100%)',
    primary2: 'linear-gradient(to bottom right, #2152d9 0%,#3370ff 30%,#4e83fd 80%, #85b1ff 100%)'
  },
  components: {
    Button,
    Input,//aaaaaaa
    Textarea,
    Switch,
    Select,
    NumberInput,
    Checkbox,
    Modal,
    Table,
    Radio
  }
});