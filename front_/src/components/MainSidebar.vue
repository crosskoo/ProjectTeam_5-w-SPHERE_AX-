<template>
  <div class="sidebar">
    <div class="top">
      <div class="fire-event-text">화재 이벤트</div>
    </div>
    <hr />
    <div class="filter">
      <el-date-picker
        v-model="dateRange"
        @keyup.enter="filterItems"
        type="daterange"
        class="custom-picker"
        start-placeholder="시작일"
        end-placeholder="종료일"
        format="YYYY-MM-DD"
      />
      <div class="search-wrapper">
        <input
          v-model="searchText"
          @keyup.enter="filterItems"
          class="search-input"
          type="text"
          placeholder=""
        />
        <span class="search-icon">
          <Icon icon="mdi:magnify" />
        </span>
      </div>
    </div>

    <div class="bottom">
      <div class="list">
        <FireEventItem
          @set-cctv="setCCTV"
          v-for="(item, index) in filteredItems"
          :key="index"
          :isSelected="selectedIndex === index"
          @click="selectItem(index)"
          :id="item.id"
          :title="item.cctvName"
          :cctvId="item.cctvId"
          :date="getDatePartKST(item.timestamp)"
          :time="getTimePartKST(item.timestamp)"
        />
      </div>
      <div class="scrollbar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import FireEventItem from './FireEventItem.vue'
import Cookies from 'js-cookie'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { Icon } from '@iconify/vue'

const userStore = useUserStore()
const dateRange = ref([])
const searchText = ref('')
const items = ref([
  // {
  //   region: '경북대학교 정문',
  //   timestamp: '2025/05/05T08:45:50',
  //   lat: 35.88894,
  //   lng: 128.610289,
  // },
  // {
  //   region: '경북대학교 북문',
  //   timestamp: '2025/05/02T23:11:40',
  //   lat: 35.88894,
  //   lng: 128.610289,
  // },
])
const filteredItems = ref([])
const selectedIndex = ref(0)

const emit = defineEmits(['setCCTV'])

watch(dateRange, () => {
  filterItems()
})

const setCCTV = (data) => {
  emit('setCCTV', data)
}

const filterItems = () => {
  const text = searchText.value.trim().toLowerCase()
  filteredItems.value = items.value.filter(
    (item) =>
      item.cctvName.toLowerCase().includes(text) &&
      isDateInRange(item.timestamp, dateRange.value)
  )
}

const isDateInRange = (targetISODateStr, dateRange) => {
  if (!Array.isArray(dateRange) || dateRange.length !== 2) return true
  const [start, end] = dateRange

  if (!start || !end) return false

  const targetDate = new Date(targetISODateStr)
  const startDate = new Date(start)
  const endDate = new Date(end)

  // 날짜 비교 (시간 포함)
  return targetDate >= startDate && targetDate <= endDate
}

const selectItem = (index) => {
  selectedIndex.value = index
}

const getDatePartKST = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTimePartKST = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)

  return date.toTimeString().split(' ')[0]
}

const getEventData = async () => {
  try {
    const promises = userStore.user.regionIds.map((regionId) =>
      axios.get('/api/events', {
        params: { region: regionId },
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      })
    )

    const responses = await Promise.all(promises)

    let events = []
    responses.forEach((res) => {
      events.push(...res.data.data.events)
    })

    items.value = events
    items.value.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    filterItems()

    console.log('이벤트 목록:', items.value)
  } catch (error) {
    console.error('Login failed:', error)
    alert('이벤트 불러오기 실패')
  }
}
defineExpose({ getEventData })

onMounted(async () => {
  getEventData()
})
</script>

<style lang="scss" scoped>
.sidebar {
  margin: 32px;
  width: 384px;
  background-color: $background2;
  color: white;
  margin: 16px;
  overflow-y: auto;
  border-radius: 8px;
  overflow: hidden;
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    .fire-event-text {
      font-size: 20px;
      margin-left: 8px;
      text-align: left;
    }
    .right {
      justify-content: right;
    }
  }
  hr {
    border: none;
    height: 2px;
    margin-right: 16px;
    margin-left: 16px;
    margin-bottom: 16px;
    background-color: $background3;
  }
  .filter {
    display: inline-flex;
    gap: 8px;

    ::v-deep(.el-date-editor.custom-picker) {
      width: 192px;
    }

    .search-wrapper {
      position: relative;
      width: 132px;
    }

    .search-input {
      outline: none;
      width: 100%;
      height: 32px;
      padding: 4px 36px 4px 12px;
      border-radius: 4px;
      border: 1px solid $background4;
      transition: border-color 0.15s ease;
      background-color: $background2;
      color: $gray2;
      font-size: 14px;
      box-sizing: border-box;
    }
    .search-input:hover {
      border-color: $gray0;
    }
    .search-input:focus {
      border-color: $gray1;
    }

    .search-icon {
      position: absolute;
      margin-top: 2px;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: #999;
      pointer-events: none;
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    margin: 8px 16px 16px 16px;
    .list {
      flex: 1;
      margin-right: 8px;
    }
    .scrollbar {
      background-color: $background4;
      width: 8px;
      border-radius: 8px;
      height: 80vh;
    }
  }
}
</style>
