<template>
  <div class="sidebar">
    <div class="top">
      <div class="fire-event-text">화재 이벤트</div>
      <div class="right">
        <button>
          <Icon
            class="icon"
            icon="iconamoon:search-fill"
            width="24"
            height="24"
          />
        </button>
        <button>
          <Icon
            class="icon"
            icon="solar:calendar-bold"
            width="24"
            height="24"
          />
        </button>
      </div>
    </div>
    <hr />
    <div class="bottom">
      <div class="list">
        <FireEventItem
          v-for="(item, index) in items"
          :key="index"
          :isSelected="selectedIndex === index"
          @click="selectItem(index)"
          :title="item.region"
          :date="getDatePart(item.timestamp)"
          :time="getTimePart(item.timestamp)"
        />
      </div>
      <div class="scrollbar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import FireEventItem from './FireEventItem.vue'
import Cookies from 'js-cookie'
import axios from 'axios'

const items = ref([
  {
    title: '경북대학교 정문',
    date: '2025/03/12',
    time: '21:09:55',
    lat: 35.88894,
    lng: 128.610289,
  },
  {
    title: '경북대학교 북문',
    date: '2025/04/03',
    time: '08:23:50',
    lat: 35.88894,
    lng: 128.610289,
  },
])

const selectedIndex = ref(0)

const selectItem = (index) => {
  selectedIndex.value = index
}

function getDatePart(isoString) {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

function getTimePart(isoString) {
  if (!isoString) return ''
  const timeWithMs = isoString.split('T')[1]
  return timeWithMs.split('.')[0]
}

onMounted(async () => {
  try {
    const response = await axios.get('/api/events', {
      params: {
        region: '6818e2ced43fd1386011c411',
      },
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    items.value = response.data.data.events
    console.log('이벤트 목록:', items.value[0].timestamp)
  } catch (error) {
    console.error('Login failed:', error)
    alert('이벤트 불러오기 실패')
  }
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
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    button {
      border: none;
      box-shadow: none;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: $background4;
      margin-left: 8px;
      .icon {
        color: $gray2;
      }
    }
    button:hover {
      background: $background3;
      cursor: pointer;
    }
  }
  hr {
    border: none;
    height: 2px;
    margin-right: 16px;
    margin-left: 16px;
    background-color: $background3;
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    margin: 16px;
    .list {
      flex: 1;
      margin-right: 8px;
    }
    .scrollbar {
      background-color: $background4;
      width: 8px;
      border-radius: 8px;
      height: 84vh;
    }
  }
}
</style>
