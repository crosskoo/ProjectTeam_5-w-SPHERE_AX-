const mongoose = require('mongoose');
const userInfo = mongoose.model('UserInfo');
const UserLogs = mongoose.model('UserLogs');
const UserRegion = mongoose.model('UserRegion')

//사용자 IP 주소 가져오기
const getUserIP = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    return forwardedIps.split(',')[0].split(':')[3];
  }
  return req.connection.remoteAddress.split(':')[3];
};

//사용자 프로필 조회
exports.getProfile = async (req,res) => {
  try {
    //토큰에서 사용자 id 가져오기기
    const userId = req.decoded.id;

    const user = await userInfo.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    //사용자 담당 지역 정보 가져오기.
    const userRegions = await UserRegion.find({user_id:userId}).populate('region_id');
    const regions = userRegions.map(ur => ({
      id: ur.region_id._id,
      name: ur.region_id.name
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.ID,
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          role: user.role,
          region: regions,
          // 알림 설정 정보 추가
          notificationSettings: user.notificationSettings || {
            kakaoEnabled: false,
            emailEnabled: true,
            fireDetection: true,
            systemAlerts: true,
            urgentOnly: false
          },
          // 카카오 연동 상태 정보 추가
          kakaoConnected: user.isKakaoTokenValid ? user.isKakaoTokenValid() : false,
          kakaoTokenExpiresAt: user.kakaoTokenExpiresAt
        }
      }
    });
  } catch(err){
    console.error('사용자 프로필 조회 시 에러:',err);
    res.status(500).json({
      status: 'error',
      message:'서버 오류'
    });
  }
};

//사용자 프로필 수정
exports.updateProfile = async(req, res) => {
  try{
    //토큰에서 사용자 id 가져오기
    const userId = req.decoded.id;
    const {name, phone, email} = req.body

    // 사용자 정보 조회
    const user = await userInfo.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) {
      const emailRegex = /.+\@.+\..+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않은 이메일 형식입니다.'
        });
      }
      user.email = email;
    }

    await user.save();

    const userLog = new UserLogs({
      event: '프로필 수정',
      IPAddress: getUserIP(req),
      user_id: user.ID,
      details: '사용자 프로필 정보 수정됨'
    });
    await userLog.save();

    // 응답
    res.status(200).json({
      status: 'success',
      message: '프로필이 성공적으로 수정되었습니다.',
      data: {
        user: {
          id: user.ID,
          name: user.name,
          email: user.email || '',
          phone: user.phone || ''
        }
      }
    });

  } catch(err){
    console.error('사용자 프로필 수정 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 알림 설정 조회
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.decoded.id;
    
    const user = await userInfo.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        notificationSettings: user.notificationSettings || {
          kakaoEnabled: false,
          emailEnabled: true,
          fireDetection: true,
          systemAlerts: true,
          urgentOnly: false
        },
        kakaoConnected: user.isKakaoTokenValid ? user.isKakaoTokenValid() : false,
        kakaoTokenExpiresAt: user.kakaoTokenExpiresAt
      }
    });
  } catch (err) {
    console.error('알림 설정 조회 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};


exports.userLogs = (req, res) => {
  const result = req.body.test;
  res.status(200).send(result);
};

exports.userInfo = (req, res) => {
  res.status(200).send('wkit get Method');
};