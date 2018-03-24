import * as moment from 'moment'

// 格式化时间
exports.formatTime = time => moment(time).format('YYYY-MM-DD hh:mm:ss')
exports.formatTimeDate = time => moment(time).format('YYYYMMDD')


// 处理成功响应
exports.success = ({ ctx, res = null, msg = '请求成功' })=> {
  ctx.body = {
    code: 0,
    data: res,
    msg
  }
  ctx.status = 200
}
