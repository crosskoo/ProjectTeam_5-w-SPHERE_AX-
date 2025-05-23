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
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

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

    console.log('이벤트 목록:', items.value)
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
