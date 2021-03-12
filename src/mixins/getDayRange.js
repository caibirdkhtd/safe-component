/**
 * 获取日期返回：
 * getDayRangeOfLastWeek（），　返回　6天前到今天的日期，　用于最近一周的情况
 * getDayRangeOfLastMonth（），　返回一个月前到今天的日期，　用于查询最近一个月的情况
 * getDayRangeOfLast3Month（），　返回三个月前到今天的日期，　用于查询最近一个月的情况
 * */
import dayjs from 'dayjs'
export default {
  methods: {
    getDayRangeOfLastWeek () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOf7Days () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLastMonth () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLast7Days () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOf30Days () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLast30Days () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(29, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLast90Days () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(89, 'day').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfCurrentMonth () {
      const startDate = dayjs().set('date', 1).format('YYYY-MM-DD')
      const endDate = dayjs().set('date', dayjs().daysInMonth()).format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfCurrentMonthToToday () {
      const startDate = dayjs().set('date', 1).format('YYYY-MM-DD')
      const endDate = dayjs().format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLast3Month () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD')
      return { startDate, endDate }
    },
    getDayRangeOfLastYear () {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
      return { startDate, endDate }
    }
  }
}
