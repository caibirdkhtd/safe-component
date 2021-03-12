'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var dayjs = _interopDefault(require('dayjs'));

var setProgress = {
  methods: {
    setProgress: function setProgress(v) {
      if (document.getElementById('progress-bar')) {
        document.getElementById('progress-bar').style.width = (v || 0) * 100 + '%';
      }
    }
  }
};

function focus (ref) {
  return {
    methods: {
      focus: function focus() {
        if (this.$refs[ref]) {
          this.$refs[ref].focus();
        }
      }
    }
  };
}

function ajax(method, args, ori, withReject) {
  // axios.defaults.headers.common['endpoint'] = `AJAX`
  args = Array.prototype.slice.call(args, 0);
  var url = args[0];
  var lc = url.indexOf('?') > 0 ? '&' : '?';
  args[0] = url + lc + '__ts=' + new Date().getTime();
  return new Promise(function (resolve, reject) {
    axios[method].apply(axios, args).then(function (response) {
      if (response.status === 401) ; else {
        if (ori !== true) {
          if (response.data.success) {
            resolve(response.data.data || response.data.result);
          } else {
            if (response.data.errorCode === 'HTTP_401') ; else {
              console.error('[fail]: ' + JSON.stringify(response.data));

              if (withReject) {
                reject(response.data);
              } else if (response.data && response.data.errorMsg) {
                // sparrow.showMessage(response.data.errorMsg, 'warn')
                console.log(response.data.errorMsg, 'warn');
              }
            }
          }
        } else resolve(response);
      }
    })["catch"](function (thrown) {
      if (thrown.response && thrown.response.status === 401) {
        if (window && window.location) {
          window.location.replace('/logout');
        }
      } else if (thrown.response && thrown.response.data && thrown.response.data.message) {
        reject(thrown.response.data);
      } else {
        console.error('[error]', thrown.message);
        console.log('从服务器获取数据发生错误！', 'warn');
        reject(thrown);
      }
    });
  });
}
function getWithReject() {
  return ajax('get', arguments, false, true);
}

function gen(name, mods) {
  if (!mods) {
    return '';
  }

  if (typeof mods === 'string') {
    return " " + name + "--" + mods;
  }

  if (Array.isArray(mods)) {
    return mods.reduce(function (ret, item) {
      return ret + gen(name, item);
    }, '');
  }

  return Object.keys(mods).reduce(function (ret, key) {
    return ret + (mods[key] ? gen(name, key) : '');
  }, '');
}
function createBEM(name) {
  return function (el, mods) {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }

    el = el ? name + "__" + el : name;
    return "safe-" + el + gen(el, mods);
  };
}

function initBEM (name) {
  return {
    data: function data() {
      return {
        bem: null
      };
    },
    created: function created() {
      this.bem = createBEM(name);
    }
  };
}

/**
 * 获取日期返回：
 * getDayRangeOfLastWeek（），　返回　6天前到今天的日期，　用于最近一周的情况
 * getDayRangeOfLastMonth（），　返回一个月前到今天的日期，　用于查询最近一个月的情况
 * getDayRangeOfLast3Month（），　返回三个月前到今天的日期，　用于查询最近一个月的情况
 * */
var getDayRange = {
  methods: {
    getDayRangeOfLastWeek: function getDayRangeOfLastWeek() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOf7Days: function getDayRangeOf7Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLastMonth: function getDayRangeOfLastMonth() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast7Days: function getDayRangeOfLast7Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOf30Days: function getDayRangeOf30Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast30Days: function getDayRangeOfLast30Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast90Days: function getDayRangeOfLast90Days() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(89, 'day').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfCurrentMonth: function getDayRangeOfCurrentMonth() {
      var startDate = dayjs().set('date', 1).format('YYYY-MM-DD');
      var endDate = dayjs().set('date', dayjs().daysInMonth()).format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfCurrentMonthToToday: function getDayRangeOfCurrentMonthToToday() {
      var startDate = dayjs().set('date', 1).format('YYYY-MM-DD');
      var endDate = dayjs().format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLast3Month: function getDayRangeOfLast3Month() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    },
    getDayRangeOfLastYear: function getDayRangeOfLastYear() {
      var endDate = dayjs().format('YYYY-MM-DD');
      var startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
      return {
        startDate: startDate,
        endDate: endDate
      };
    }
  }
};

/**
 * el-table： 第一列靠左，其余居中样式。
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
var tableCellStyle = {
  methods: {
    getHeaderCellStyle: function getHeaderCellStyle(_ref) {
      var columnIndex = _ref.columnIndex;
      return {
        'text-align': columnIndex ? 'center' : 'left',
        'font-size': '14px',
        'line-weight': 500
      };
    },
    getCellStyle: function getCellStyle(_ref2) {
      var columnIndex = _ref2.columnIndex;
      return {
        'text-align': columnIndex ? 'center' : 'left'
      };
    }
  }
};

/**
 * el-table： centerIndexArr: 需要局中的列的序列号
 * getHeaderCellStyle(), headerCell
 * getCellStyle(), bodyCell
 * */
function tableMultiCellStyle (centerIndexArr) {
  return {
    methods: {
      getHeaderCellStyle: function getHeaderCellStyle(_ref) {
        var columnIndex = _ref.columnIndex;
        var isCenter = centerIndexArr.indexOf(columnIndex) > -1;
        return {
          'text-align': isCenter ? 'center' : 'left',
          'font-size': '14px',
          'line-weight': 500
        };
      },
      getCellStyle: function getCellStyle(_ref2) {
        var columnIndex = _ref2.columnIndex;
        var isCenter = centerIndexArr.indexOf(columnIndex) > -1;
        return {
          'text-align': isCenter ? 'center' : 'left'
        };
      }
    }
  };
}

/**
 * pageSize: 每页显示数量，默认10
 * loadList: 刷新列表调用的方法
 * */
function pageProps (pageSize) {
  return {
    data: function data() {
      return {
        hasNext: false,
        isLoading: true,
        pageIndex: 1,
        pageSize: pageSize || 10,
        records: []
      };
    },
    methods: {
      pageChange: function pageChange(tmp) {
        this.pageIndex = this.pageIndex + tmp;

        if (this.loadList) {
          this.loadList(tmp);
        }
      },
      // 序号
      indexMethod: function indexMethod(index) {
        index = index + 1;

        if (this.pageIndex > 1) {
          return (this.pageIndex - 1) * this.pageSize + index;
        } else {
          return index;
        }
      }
    }
  };
}

function getFileUrl(ossKey) {
  ossKey = encodeURI(ossKey);
  return getWithReject("/safety/safety-common-service/oss/getFileUrlJsonType/safe/100?key=".concat(ossKey, "&projectType=safe&expireMinutes=100"));
} // 保留两位小数

var downLoad = {
  methods: {
    downLoadFile: function downLoadFile(ossKey) {
      var _this = this;

      getFileUrl(ossKey).then(function (data) {
        _this.downloadByIframe(data.result);
      }, function (err) {
        console.log(err);
      });
    },
    // 无闪现下载excel
    downloadByIframe: function downloadByIframe(url) {
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';

      function iframeLoad() {
        var win = iframe.contentWindow;
        var doc = win.document;

        if (win.location.href === url) {
          if (doc.body.childNodes.length > 0) ;

          iframe.parentNode.removeChild(iframe);
        }
      }

      if ('onload' in iframe) {
        iframe.onload = iframeLoad;
      } else if (iframe.attachEvent) {
        iframe.attachEvent('onload', iframeLoad);
      } else {
        iframe.onreadystatechange = function onreadystatechange() {
          if (iframe.readyState === 'complete') {
            iframeLoad();
          }
        };
      }

      iframe.src = '';
      document.body.appendChild(iframe);
      setTimeout(function () {
        iframe.contentWindow.location.href = url;
      }, 50);
    }
  }
};

var TableHeightMixin = {
  data: function data() {
    return {
      tableHeight: 300,
      diffHeight: 60
    };
  },
  mounted: function mounted() {
    window.addEventListener('resize', this.getTableHeight, false);
    this.getTableHeight();
  },
  destroyed: function destroyed() {
    window.removeEventListener('resize', this.getTableHeight);
  },
  methods: {
    getTableHeight: function getTableHeight() {
      var _this = this;

      this.$nextTick(function () {
        // console.log('this.$refs.content && this.$refs.content.offsetHeight', this.$refs.content && this.$refs.content.offsetHeight)
        _this.tableHeight = _this.$refs.content && _this.$refs.content.offsetHeight - _this.diffHeight;
      });
    }
  }
};

var DialogTableSizeMixin = {
  data: function data() {
    return {
      tableHeight: 300,
      bodyHeight: 500,
      isShortScreen: false,
      isLowScreen: false
    };
  },
  mounted: function mounted() {
    this.checkHeight();
    this.checkWeight();
  },
  methods: {
    checkHeight: function checkHeight() {
      this.bodyHeight = document.body.clientHeight;
      this.isLowScreen = document.body.clientHeight < 780;
      this.tableHeight = this.isLowScreen ? 300 : 480;
    },
    checkWeight: function checkWeight() {
      this.isShortScreen = document.body.clientWidth < 1300;
    }
  }
};

exports.DialogTableSizeMixin = DialogTableSizeMixin;
exports.TableHeightMixin = TableHeightMixin;
exports.downLoadMixin = downLoad;
exports.focus = focus;
exports.getDayRange = getDayRange;
exports.initBEM = initBEM;
exports.pageProps = pageProps;
exports.setProgress = setProgress;
exports.tableCellStyle = tableCellStyle;
exports.tableMultiCellStyle = tableMultiCellStyle;
