/**
 * Layui component locales — Vietnamese & English.
 * Chinese (zh-CN) is built into Layui.
 * Structure mirrors Layui's internal zhCN object in modules/i18n.js.
 */

export const vi = {
  colorpicker: { clear: 'Xoá', confirm: 'Xác nhận' },
  dropdown: { noData: 'Không có dữ liệu' },
  flow: { loadMore: 'Tải thêm', noMore: 'Không còn dữ liệu' },
  form: {
    select: { noData: 'Không có dữ liệu', noMatch: 'Không tìm thấy', placeholder: 'Vui lòng chọn' },
    validateMessages: {
      required: 'Trường bắt buộc không được để trống',
      phone: 'Số điện thoại không đúng',
      email: 'Email không đúng định dạng',
      url: 'Đường dẫn không đúng',
      number: 'Chỉ được nhập số',
      date: 'Ngày không đúng định dạng',
      identity: 'Số CMND không đúng'
    },
    verifyErrorPromptTitle: 'Thông báo'
  },
  laydate: {
    months: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
    weeks: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    time: ['Giờ', 'Phút', 'Giây'],
    literal: { year: '' },
    selectDate: 'Chọn ngày',
    selectTime: 'Chọn giờ',
    startTime: 'Bắt đầu',
    endTime: 'Kết thúc',
    tools: { confirm: 'Xác nhận', clear: 'Xoá', now: 'Hôm nay', reset: 'Đặt lại' },
    rangeOrderPrompt: 'Thời gian kết thúc không thể sớm hơn bắt đầu\nVui lòng chọn lại',
    invalidDatePrompt: 'Không nằm trong phạm vi hợp lệ\n',
    formatErrorPrompt: 'Định dạng ngày không hợp lệ\nĐịnh dạng yêu cầu:\n{format}\n',
    autoResetPrompt: 'Đã tự động đặt lại',
    preview: 'Kết quả đã chọn'
  },
  layer: {
    confirm: 'Xác nhận',
    cancel: 'Huỷ',
    defaultTitle: 'Thông tin',
    prompt: { InputLengthPrompt: 'Tối đa {length} ký tự' },
    photos: {
      noData: 'Không có ảnh',
      tools: { rotate: 'Xoay', scaleX: 'Lật ngang', zoomIn: 'Phóng to', zoomOut: 'Thu nhỏ', reset: 'Đặt lại', close: 'Đóng' },
      viewPicture: 'Xem ảnh gốc',
      urlError: { prompt: 'Đường dẫn ảnh bị lỗi,\nxem ảnh tiếp theo?', confirm: 'Tiếp', cancel: 'Đóng' }
    }
  },
  laypage: {
    prev: 'Trước',
    next: 'Sau',
    first: 'Đầu',
    last: 'Cuối',
    total: 'Tổng {total} mục',
    pagesize: 'mục/trang',
    goto: 'Đến trang',
    page: '',
    confirm: 'Đi'
  },
  table: {
    sort: { asc: 'Tăng dần', desc: 'Giảm dần' },
    noData: 'Không có dữ liệu',
    tools: {
      filter: { title: 'Lọc cột' },
      export: { title: 'Xuất', noDataPrompt: 'Bảng không có dữ liệu', compatPrompt: 'Không hỗ trợ IE, vui lòng dùng Chrome', csvText: 'Xuất CSV' },
      print: { title: 'In', noDataPrompt: 'Bảng không có dữ liệu' }
    },
    dataFormatError: 'Dữ liệu trả về không đúng định dạng: "{statusName}": {statusCode}',
    xhrError: 'Yêu cầu thất bại: {msg}'
  },
  transfer: { noData: 'Không có dữ liệu', noMatch: 'Không tìm thấy', title: ['Danh sách 1', 'Danh sách 2'], searchPlaceholder: 'Tìm kiếm' },
  tree: { defaultNodeName: 'Chưa đặt tên', noData: 'Không có dữ liệu', deleteNodePrompt: 'Xác nhận xoá "{name}"?' },
  upload: {
    fileType: { file: 'tệp', image: 'ảnh', video: 'video', audio: 'âm thanh' },
    validateMessages: {
      fileExtensionError: '{fileType} có định dạng không được hỗ trợ',
      filesOverLengthLimit: 'Tối đa {length} tệp',
      currentFilesLength: 'Đã chọn: {length} tệp',
      fileOverSizeLimit: 'Kích thước tệp không được vượt quá {size}'
    },
    chooseText: '{length} tệp'
  },
  util: {
    timeAgo: { days: '{days} ngày trước', hours: '{hours} giờ trước', minutes: '{minutes} phút trước', future: 'Sắp tới', justNow: 'Vừa xong' },
    toDateString: {
      meridiem: function (hours) { return hours < 12 ? 'SA' : 'CH' }
    }
  }
}

export const en = {
  colorpicker: { clear: 'Clear', confirm: 'OK' },
  dropdown: { noData: 'No data' },
  flow: { loadMore: 'Load more', noMore: 'No more data' },
  form: {
    select: { noData: 'No data', noMatch: 'No match', placeholder: 'Please select' },
    validateMessages: {
      required: 'This field is required',
      phone: 'Invalid phone number',
      email: 'Invalid email address',
      url: 'Invalid URL',
      number: 'Numbers only',
      date: 'Invalid date format',
      identity: 'Invalid ID number'
    },
    verifyErrorPromptTitle: 'Notice'
  },
  laydate: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    time: ['Hour', 'Min', 'Sec'],
    literal: { year: '' },
    selectDate: 'Select date',
    selectTime: 'Select time',
    startTime: 'Start',
    endTime: 'End',
    tools: { confirm: 'OK', clear: 'Clear', now: 'Now', reset: 'Reset' },
    rangeOrderPrompt: 'End time cannot be earlier than start time\nPlease reselect',
    invalidDatePrompt: 'Not within valid date/time range\n',
    formatErrorPrompt: 'Invalid date format\nRequired format:\n{format}\n',
    autoResetPrompt: 'Auto reset',
    preview: 'Selected result'
  },
  layer: {
    confirm: 'OK',
    cancel: 'Cancel',
    defaultTitle: 'Info',
    prompt: { InputLengthPrompt: 'Max {length} characters' },
    photos: {
      noData: 'No images',
      tools: { rotate: 'Rotate', scaleX: 'Flip', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset', close: 'Close' },
      viewPicture: 'View original',
      urlError: { prompt: 'Image URL error.\nView next image?', confirm: 'Next', cancel: 'Close' }
    }
  },
  laypage: {
    prev: 'Prev',
    next: 'Next',
    first: 'First',
    last: 'Last',
    total: 'Total {total}',
    pagesize: '/page',
    goto: 'Go to',
    page: '',
    confirm: 'Go'
  },
  table: {
    sort: { asc: 'Ascending', desc: 'Descending' },
    noData: 'No data',
    tools: {
      filter: { title: 'Filter columns' },
      export: { title: 'Export', noDataPrompt: 'No data to export', compatPrompt: 'Export not supported in IE, use Chrome', csvText: 'Export CSV' },
      print: { title: 'Print', noDataPrompt: 'No data to print' }
    },
    dataFormatError: 'Invalid data format. Expected: "{statusName}": {statusCode}',
    xhrError: 'Request failed: {msg}'
  },
  transfer: { noData: 'No data', noMatch: 'No match', title: ['List 1', 'List 2'], searchPlaceholder: 'Search' },
  tree: { defaultNodeName: 'Unnamed', noData: 'No data', deleteNodePrompt: 'Delete "{name}"?' },
  upload: {
    fileType: { file: 'file', image: 'image', video: 'video', audio: 'audio' },
    validateMessages: {
      fileExtensionError: 'Unsupported {fileType} format',
      filesOverLengthLimit: 'Max {length} files',
      currentFilesLength: '{length} files selected',
      fileOverSizeLimit: 'File size cannot exceed {size}'
    },
    chooseText: '{length} files'
  },
  util: {
    timeAgo: { days: '{days}d ago', hours: '{hours}h ago', minutes: '{minutes}m ago', future: 'Future', justNow: 'Just now' },
    toDateString: {
      meridiem: function (hours) { return hours < 12 ? 'AM' : 'PM' }
    }
  }
}
