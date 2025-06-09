<template>
  <div class="container">
    <div class="header">
      <div class="title">설정</div>
      <div class="right">
        {{ username }}님
        <div class="button" @click="toggleMenu">
          <Icon class="icon" icon="charm:menu-kebab" />
        </div>
        <ul v-if="menuOpen" class="dropdown-menu">
          <li @click="goToMain">메인</li>
          <li @click="goToAccount">설정</li>
          <li @click="logout">로그아웃</li>
        </ul>
      </div>
    </div>
    <div class="main">
      <div class="sidebar">
        <button
          class="item on"
          :class="{ active: activeTab === 1 }"
          @click="setActiveTab(1)"
        >
          프로필
        </button>
        <hr class="divider" />
        <p class="caption">관리자</p>
        <button
          class="item"
          :class="{ active: activeTab === 2 }"
          @click="setActiveTab(2)"
        >
          계정 생성
        </button>
        <button
          class="item"
          :class="{ active: activeTab === 3 }"
          @click="setActiveTab(3)"
        >
          계정 삭제
        </button>
        <button
          class="item"
          :class="{ active: activeTab === 4 }"
          @click="setActiveTab(4)"
        >
          지역 관리
        </button>
        <button
          class="item"
          :class="{ active: activeTab === 5 }"
          @click="setActiveTab(5)"
        >
          CCTV 관리
        </button>
      </div>
      <div class="content-container">
        <div class="content" v-if="activeTab === 1">
          <div class="input-group">
            <label class="label" for="user-name">사용자 이름</label>
            <input type="text" id="user-name" v-model="userName" required />
          </div>
          <div class="input-group">
            <label class="label" for="phone-number">전화번호</label>
            <input
              type="tel"
              id="phone-number"
              v-model="phoneNumber"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="email">이메일</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <button @click="updateProfile">프로필 수정</button>
        </div>
        <div class="content" v-else-if="activeTab === 2">
          <div class="input-group">
            <label class="label" for="create-id">아이디</label>
            <input type="text" id="create-id" v-model="createId" required />
          </div>
          <div class="input-group">
            <label class="label" for="create-password">비밀번호</label>
            <input
              type="password"
              id="create-password"
              v-model="createPassword"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="password-check">비밀번호 확인</label>
            <input
              type="password"
              id="password-check"
              v-model="passwordCheck"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="create-user-name">사용자 이름</label>
            <input
              type="text"
              id="create-user-name"
              v-model="createUserName"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="region">지역</label>
            <input type="text" id="region" v-model="region" required />
          </div>
          <div class="input-group">
            <label class="label" for="role">권한</label>
            <input type="text" id="role" v-model="role" required />
          </div>
          <button @click="createAccount">계정 생성</button>
        </div>
        <div class="content" v-else-if="activeTab === 3">
          <div class="input-group">
            <label class="label" for="delete-user-id">아이디</label>
            <input
              type="text"
              id="delete-user-id"
              v-model="deleteUserId"
              required
            />
          </div>
          <button @click="deleteAccount">계정 삭제</button>
        </div>
        <div class="content" v-else-if="activeTab === 4">
          <div class="input-group">
            <label class="label" for="add-region-name">지역명</label>
            <input
              type="text"
              id="add-region-name"
              v-model="addRegionName"
              required
            />
          </div>
          <button @click="addRegion">지역 추가</button>
          <div class="input-group">
            <label class="label" for="del-region-name">지역명</label>
            <input
              type="text"
              id="del-region-name"
              v-model="delRegionName"
              required
            />
          </div>
          <button @click="delRegion">지역 삭제</button>
        </div>
        <div class="content" v-else-if="activeTab === 5">
          <div class="input-group">
            <label class="label" for="add-cctv-name">CCTV 이름</label>
            <input
              type="text"
              id="add-cctv-name"
              v-model="addCCTVName"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="add-stream-url">stream url</label>
            <input
              type="url"
              id="add-stream-url"
              v-model="addStreamUrl"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="add-cctv-lat">CCTV 위도</label>
            <input
              type="number"
              id="add-cctv-lat"
              v-model="addCCTVLat"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="add-cctv-lng">CCTV 경도</label>
            <input
              type="number"
              id="add-cctv-lng"
              v-model="addCCTVLng"
              required
            />
          </div>
          <div class="input-group">
            <label class="label" for="add-cctv-region">지역명</label>
            <input
              type="text"
              id="add-cctv-region"
              v-model="addCCTVRegion"
              required
            />
          </div>
          <button @click="addCCTV">CCTV 추가</button>
          <div class="input-group">
            <label class="label" for="del-cctv-name">CCTV 이름</label>
            <input
              type="text"
              id="del-cctv-name"
              v-model="delCCTVname"
              required
            />
          </div>
          <button @click="delCCTV">CCTV 삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import axios from 'axios'
import { useLogout } from '@/composables/useLogout'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

const username = userStore.user?.name

const activeTab = ref(1)
const menuOpen = ref(false)
const router = useRouter()

const isDisabled = ref(true)

const userName = ref('')
const phoneNumber = ref('')
const email = ref('')
const createId = ref('')
const createUserName = ref('')
const createPassword = ref('')
const passwordCheck = ref('')
const region = ref('')
const role = ref('')
const deleteUserId = ref('')
const addRegionName = ref('')
const delRegionName = ref('')
const addCCTVName = ref('')
const addStreamUrl = ref('')
const addCCTVLat = ref('')
const addCCTVLng = ref('')
const addCCTVRegion = ref('')
const delCCTVname = ref('')

const { logout } = useLogout()

const updateProfile = async () => {
  try {
    const response = await axios.put(
      '/api/users/profile',
      {
        name: userName.value,
        email: email.value,
        phone: phoneNumber.value,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      }
    )
    console.log('프로필 수정 성공:', response.data)
    alert('프로필 수정 성공')
  } catch (error) {
    console.error('프로필 수정 실패:', error)
    alert('프로필 수정 실패 입력 양식을 확인해주세요')
  }
}

const createAccount = async () => {
  if (createPassword.value === passwordCheck.value) {
    try {
      const response = await axios.post(
        '/api/auth/admin/register',
        {
          id: createId.value,
          password: createPassword.value,
          name: createUserName.value,
          region: region.value,
          role: role.value,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('authToken')}`,
          },
        }
      )
      console.log('계정 생성 성공:', response.data)
      alert('계정 생성 성공')
    } catch (error) {
      console.error('계정 생성 실패:', error)
      alert('계정 생성 실패')
    }
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
}

const deleteAccount = async () => {
  try {
    const response = await axios.delete(
      `/api/auth/admin/users/${deleteUserId.value}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      }
    )
    console.log('계정 삭제 성공:', response.data)
    alert('계정 삭제 성공')
  } catch (error) {
    console.error('계정 삭제 실패:', error)
    alert('계정 삭제 실패')
  }
}

const addRegion = async () => {
  console.log('입력지역명: ', addRegionName.value)

  try {
    const response = await axios.post(
      `/api/regions`,
      {
        name: addRegionName.value,
        bounds: {
          northeast: {
            lat: 0,
            lng: 0,
          },
          southwest: {
            lat: 0,
            lng: 0,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      }
    )
    console.log('지역 추가 성공:', response.data)
    alert('지역 추가 성공')
  } catch (error) {
    console.error('지역 추가 실패:', error)
    alert('지역 추가 실패')
  }
}

const delRegion = async () => {
  console.log(delRegionName.value)

  try {
    let response = await axios.get(`/api/regions`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('response: ', response.data.data.regions)
    let regionId = response.data.data.regions.find(
      (region) => region.name === delRegionName.value
    )?.id

    response = await axios.delete(`/api/regions/${regionId}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('지역 삭제 성공:', response.data)
    alert('지역 삭제 성공')
  } catch (error) {
    console.error('지역 삭제 실패:', error)
    alert('지역 삭제 실패')
  }
}

const addCCTV = async () => {
  console.log('addCCTV: ', addCCTVName.value)

  try {
    let response = await axios.get(`/api/regions`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('response: ', response.data.data.regions)
    let regionId = response.data.data.regions.find(
      (region) => region.name === addCCTVRegion.value
    )?.id

    response = await axios.post(
      `/api/cctv`,
      {
        name: addCCTVName.value,
        streamUrl: addStreamUrl.value,
        location: {
          lat: addCCTVLat.value,
          lng: addCCTVLng.value,
        },
        region_id: regionId,
        status: 'active',
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      }
    )
    console.log('CCTV 추가 성공:', response.data)
    alert('CCTV 추가 성공')
  } catch (error) {
    console.error('CCTV 추가 실패:', error)
    alert('CCTV 추가 실패')
  }
}

const delCCTV = async () => {
  console.log(delCCTVname.value)

  try {
    let response = await axios.get(`/api/cctv`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('response: ', response.data.data.cctvs)
    let cctvId = response.data.data.cctvs.find(
      (cctv) => cctv.name === delCCTVname.value
    )?.id

    response = await axios.delete(`/api/cctv/${cctvId}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('cctv 삭제 성공:', response.data)
    alert('cctv 삭제 성공')
  } catch (error) {
    console.error('cctv 삭제 실패:', error)
    alert('cctv 삭제 실패')
  }
}

onMounted(async () => {
  const token = Cookies.get('authToken')
  if (!token) {
    router.push('/login')
  }

  try {
    const response = await axios.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })
    console.log('프로필 데이터:', response.data.data.user)
    userName.value = response.data.data.user.name
    phoneNumber.value = response.data.data.user.phone
    email.value = response.data.data.user.email

    if (response.data.data.user.role === 'admin') isDisabled.value = false
  } catch (error) {
    console.error('프로필 불러오기 실패:', error)
    alert('프로필 불러오기 실패')
  }
})

function setActiveTab(tabIndex) {
  activeTab.value = tabIndex
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

const goToMain = () => {
  router.push('/main')
}
const goToAccount = () => {
  router.push('/account')
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background: $background3;
  justify-content: center;
}

.header {
  flex: 1;
  display: flex;
  justify-content: space-between;
  height: 84px;
  color: white;
  align-items: center;
  background: $background1;

  .title {
    margin-left: 32px;
    padding: 640px;
    font-size: 24px;
  }
  .right {
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 16px;

    .button {
      margin-left: 8px;
      height: 36px;
      width: 36px;
      border-radius: 8px;
      background: $background1;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        height: 20px;
        width: 20px;
        pointer-events: none;
      }
    }
    .button:hover {
      background: $background4;
      cursor: pointer;
    }
    .dropdown-menu {
      position: absolute;
      padding: 8px 0 8px 0;
      top: 36px;
      right: 0;
      background-color: $background1;
      border: 1px solid $background2;
      border-radius: 8px;
      box-shadow: 0px 2px 4px $background1;
      list-style: none;
      margin: 0;
      z-index: 999;
    }
    .dropdown-menu li {
      width: 128px;
      height: 32px;
      font-size: 14px;
      padding-left: 8px;
      align-content: center;
      text-align: left;
      cursor: pointer;
      color: white;
      margin: 0 8px 0 8px;
      border-radius: 4px;
    }

    .dropdown-menu li:hover {
      background-color: $background2;
    }
  }
}

.main {
  height: 100%;
  display: flex;
  justify-content: center;
  background: $background2;
  margin: 0 auto;

  .sidebar {
    height: 100%;
    width: 192px;
    padding-top: 64px;

    .divider {
      // margin: 20px auto;
      width: 100%;
      height: 1px;
      background-color: $background4; /* 구분선 색상 */
      border: none;
    }
    .caption {
      text-align: left;
      padding-left: 12px;
      margin-bottom: 4px;
      font-size: 14px;
      color: $gray1;
    }

    .item {
      all: unset;
      width: 192px;
      height: 36px;
      color: $gray2;
      text-align: left;
      font-size: 16px;
      align-content: center;
      text-indent: 12px;
      border-radius: 8px;
      cursor: pointer;
    }
    .item:hover {
      background: $background3;
    }
    .item.active {
      background-color: $background4;
    }
  }
  .content-container {
    height: 100%;
    width: 384px;
    padding-top: 64px;

    .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-left: 32px;

      button {
        height: 36px;
        font-size: 16px;
        font-family: 'Noto Sans', sans-serif;
        padding-bottom: 4px;
        background: $point1;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        height: 36px;
        margin-top: 16px;
        margin-left: 4px;
        margin-bottom: 32px;
        width: 96px;
        user-select: none;
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE/Edge */
      }
      button:hover {
        background: $point2;
      }
      button:active {
        background: $point3;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        text-align: left;

        color: white;
        font-family: 'Noto Sans', sans-serif;

        .label {
          padding-bottom: 8px;
          font-size: 16px;
        }

        input {
          all: unset;
          height: 36px;
          width: 320px;
          margin-bottom: 8px;
          background: $background1;
          border-radius: 8px;
          padding: 0px 16px;
          border: 1px solid $background4;
          color: $gray2;
          font-size: 14px;
        }
        input:focus {
          border: 1px solid $gray1;
        }
      }
    }
  }
}
</style>
