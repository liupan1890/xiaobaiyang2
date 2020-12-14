import { defineComponent, h, ref, Ref, reactive, nextTick, watchEffect } from 'vue'

interface ListReactData {
  scrollYLoad: boolean
  bodyHeight: number
  rowHeight: number
  topSpaceHeight: number
  items: any[]
  ts: number
}
interface ListInternalData {
  fullData: any[]
  lastScrollLeft: number
  lastScrollTop: number
  scrollYStore: {
    startIndex: number
    endIndex: number
    visibleIndex: number
    visibleSize: number
    offsetSize: number
  }
}
export default defineComponent({
  name: 'VxeList',
  props: {
    id: {
      type: String,
      default: 'id',
    },
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
    datats: {
      type: Number,
      default: 0,
    },
    scrollYMinCount: {
      type: Number,
      default: 10,
    },
    rowHeight: {
      type: Number,
      default: 100,
    },
  },

  setup(props, context) {
    const reactData = reactive({
      scrollYLoad: false,
      bodyHeight: 0,
      rowHeight: props.rowHeight,
      topSpaceHeight: 0,
      items: [],
      ts: 0,
    } as ListReactData)

    const refVirtualWrapper = ref() as Ref<HTMLDivElement>

    const internalData: ListInternalData = {
      fullData: [],
      lastScrollLeft: 0,
      lastScrollTop: 0,
      scrollYStore: {
        startIndex: 0,
        endIndex: 0,
        visibleIndex: 0,
        visibleSize: 0,
        offsetSize: 0,
      },
    }

    const updateYSpace = () => {
      reactData.bodyHeight = reactData.scrollYLoad ? internalData.fullData.length * reactData.rowHeight : 0
      reactData.topSpaceHeight = reactData.scrollYLoad ? Math.max(internalData.scrollYStore.startIndex * reactData.rowHeight, 0) : 0
    }

    const handleData = () => {
      reactData.items = reactData.scrollYLoad ? internalData.fullData.slice(internalData.scrollYStore.startIndex, internalData.scrollYStore.endIndex) : internalData.fullData.slice(0)
      return nextTick()
    }

    const updateYData = () => {
      handleData()
      updateYSpace()
    }

    const computeScrollLoad = () => {
      return nextTick().then(() => {
        if (reactData.scrollYLoad) {
          const scrollBodyElem = refVirtualWrapper.value
          const visibleYSize = Math.max(8, Math.ceil(scrollBodyElem.clientHeight / reactData.rowHeight))
          const offsetYSize = 10
          internalData.scrollYStore.offsetSize = offsetYSize
          internalData.scrollYStore.visibleSize = visibleYSize
          internalData.scrollYStore.endIndex = Math.max(internalData.scrollYStore.startIndex, visibleYSize + offsetYSize, internalData.scrollYStore.endIndex)
          updateYData()
        } else {
          updateYSpace()
        }
      })
    }

    const clearScroll = () => {
      const scrollBodyElem = refVirtualWrapper.value
      if (scrollBodyElem) {
        scrollBodyElem.scrollTop = 0
      }
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(nextTick())
        })
      })
    }

    const scrollTo = (scrollLeft: number | null, scrollTop?: number | null) => {
      const scrollBodyElem = refVirtualWrapper.value
      if (scrollLeft) {
        scrollBodyElem.scrollLeft = scrollLeft
      }
      if (scrollTop) {
        scrollBodyElem.scrollTop = scrollTop
      }
      if (reactData.scrollYLoad) {
        return new Promise((resolve) => setTimeout(() => resolve(nextTick()), 50))
      }
      return nextTick()
    }

    const refreshScroll = () => {
      return clearScroll().then(() => {
        if (internalData.lastScrollLeft || internalData.lastScrollTop) {
          internalData.lastScrollLeft = 0
          internalData.lastScrollTop = 0
          return scrollTo(internalData.lastScrollLeft, internalData.lastScrollTop)
        }
      })
    }

    const loadYData = (evnt: Event) => {
      const { startIndex, endIndex, visibleSize, offsetSize } = internalData.scrollYStore
      const scrollBodyElem = evnt.target as HTMLDivElement
      const scrollTop = scrollBodyElem.scrollTop
      const toVisibleIndex = Math.floor(scrollTop / reactData.rowHeight)
      const offsetStartIndex = Math.max(0, toVisibleIndex - 1 - offsetSize)
      const offsetEndIndex = toVisibleIndex + visibleSize + offsetSize
      if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
        if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
          internalData.scrollYStore.startIndex = offsetStartIndex
          internalData.scrollYStore.endIndex = offsetEndIndex
          updateYData()
        }
      }
    }

    const scrollEvent = (evnt: Event) => {
      const scrollBodyElem = evnt.target as HTMLDivElement
      const scrollTop = scrollBodyElem.scrollTop
      const scrollLeft = scrollBodyElem.scrollLeft
      internalData.lastScrollTop = scrollTop
      internalData.lastScrollLeft = scrollLeft
      if (reactData.scrollYLoad) {
        loadYData(evnt)
      }
    }

    const loadData = (datas: any) => {
      const issame = datas.length > 0 && internalData.fullData.length > 0 && datas[0].key === internalData.fullData[0].key
      internalData.fullData = datas
      if (issame === false) {
        internalData.scrollYStore.startIndex = 0
        internalData.scrollYStore.visibleIndex = 0
        const mincount = props.scrollYMinCount || 0
        reactData.scrollYLoad = mincount > -1 && mincount <= datas.length
      }
      handleData()
      return computeScrollLoad().then(() => {
        if (issame === false) refreshScroll()
      })
    }

    watchEffect(() => {
      reactData.ts = props.datats
      loadData(props.data)
    })

    const renderN = () => {
      return h(
        'div',
        {
          class: ['vxe-list'],
        },
        [
          h(
            'div',
            {
              ref: refVirtualWrapper,
              class: 'vxe-list--virtual-wrapper',
              onScroll: scrollEvent,
            },
            [
              h('div', {
                class: 'vxe-list--y-space',
                style: {
                  height: reactData.bodyHeight ? `${reactData.bodyHeight}px` : 'auto',
                },
              }),
              h(
                'div',
                {
                  class: 'vxe-list--body',
                  style: {
                    transform: reactData.topSpaceHeight ? 'translateY(' + reactData.topSpaceHeight + 'px)' : 'translateY(0px)',
                  },
                },
                context.slots.default ? context.slots.default({ items: reactData.items }) : []
              ),
            ]
          ),
        ]
      )
    }

    return {
      renderN,
    }
  },
  render() {
    return this.renderN()
  },
})
