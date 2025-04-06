const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/node_config');
const UserInfo = mongoose.model('UserInfo');
const UserLogs = mongoose.model('UserLogs');
const RefreshToken = mongoose.model('RefreshToken');
const UserRegion = mongoose.model('UserRegion');

// 사용자 IP 주소 가져오기
const getUserIP = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    return forwardedIps.split(',')[0].trim();
  }
  return req.connection.remoteAddress;
};

// JWT 토큰 생성
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      ID: user.ID 
    }, 
    config.UsertokenSecret, 
    { expiresIn: '1h' }
  );
};

// 리프레시 토큰 생성
const generateRefreshToken = async (userId) => {
  // 랜덤 토큰 생성
  const tokenValue = crypto.randomBytes(40).toString('hex');
  
  // 만료 시간 설정 (30일)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // DB에 리프레시 토큰 저장
  const refreshToken = new RefreshToken({
    token: tokenValue,
    user_id: userId,
    expiresAt: expiresAt,
    issuedAt: new Date()
  });
  
  await refreshToken.save();
  return tokenValue;
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;
    
    if (!id || !password) {
      return res.status(400).json({
        status: 'error',
        message: '아이디와 비밀번호를 모두 입력해주세요.'
      });
    }
    
    // 사용자 찾기
    const user = await UserInfo.findOne({ ID: id });
    
    if (!user) {
      // 로그인 실패 기록
      const userLog = new UserLogs({
        event: '사용자 접속(로그인 실패)',
        IPAddress: getUserIP(req),
        user_id: id,
        details: '존재하지 않는 사용자'
      });
      await userLog.save();
      
      return res.status(401).json({
        status: 'error',
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    }
    console.log('사용자 ID:', user.ID);
    console.log('사용자 salt:', user.salt);
    console.log('입력된 비밀번호:', password);
    console.log('저장된 해시 비밀번호:', user.PASSWORD);
    console.log('생성된 해시:', user.hashPassword(password));
    // 비밀번호 확인
    if (!user.authenticate(password)) {
      // 로그인 실패 기록
      const userLog = new UserLogs({
        event: '사용자 접속(로그인 실패)',
        IPAddress: getUserIP(req),
        user_id: id,
        details: '비밀번호 불일치'
      });
      await userLog.save();
      
      return res.status(401).json({
        status: 'error',
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    }
    
    // 토큰 생성
    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user._id);
    
    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();
    
    // 로그인 성공 기록
    const userLog = new UserLogs({
      event: '사용자 접속(로그인)',
      IPAddress: getUserIP(req),
      user_id: user.ID
    });
    await userLog.save();
    
    // 사용자 담당 지역 정보 가져오기
    const userRegions = await UserRegion.find({ user_id: user._id }).populate('region_id');
    const regions = userRegions.map(ur => ur.region_id.name);
    
    // 응답
    res.status(200).json({
      status: 'success',
      data: {
        token,
        refreshToken,
        user: {
          id: user.ID,
          name: user.name,
          role: user.role,
          region: regions.length > 0 ? regions.join(', ') : ''
        }
      }
    });
  } catch (err) {
    console.error('로그인 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 계정 생성 (관리자 전용)
exports.register = async (req, res) => {
  try {
    // 현재 사용자가 관리자인지 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 계정을 생성할 수 있습니다.'
      });
    }
    
    const { id, password, name, region, role = 'user' } = req.body;
    
    if (!id || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: '필수 정보가 누락되었습니다.'
      });
    }
    
    // 사용자 ID 중복 확인
    const existingUser = await UserInfo.findOne({ ID: id });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '이미 존재하는 아이디입니다.'
      });
    }
    
    // 지역 ID 유효성 확인
    if (region) {
      const regionExists = await mongoose.model('Region').findById(region);
      if (!regionExists) {
        return res.status(400).json({
          status: 'error',
          message: '존재하지 않는 지역입니다.'
        });
      }
    }
    
    // 새 사용자 생성
    const newUser = new UserInfo({
      ID: id,
      PASSWORD: password,
      name,
      role: role === 'admin' ? 'admin' : 'user'
    });
    
    await newUser.save();
    
    // 지역 연결
    if (region) {
      const userRegion = new UserRegion({
        user_id: newUser._id,
        region_id: region
      });
      await userRegion.save();
    }
    
    // 계정 생성 로그
    const userLog = new UserLogs({
      event: '계정 생성',
      IPAddress: getUserIP(req),
      user_id: req.decoded.ID,
      details: `새 사용자 ${id} 생성됨`
    });
    await userLog.save();
    
    res.status(201).json({
      status: 'success',
      message: '계정이 성공적으로 생성되었습니다.',
      data: {
        id: newUser.ID
      }
    });
  } catch (err) {
    console.error('계정 생성 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 계정 삭제
exports.deleteUser = async (req, res) => {
  try {
    // 현재 사용자가 관리자인지 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 계정을 삭제할 수 있습니다.'
      });
    }
    
    const userId = req.params.userId;
    
    // 사용자 존재 확인 (ID로 검색)
    const user = await UserInfo.findOne({ ID: userId });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 자기 자신을 삭제하려는 경우 방지
    if (user._id.toString() === req.decoded.id) {
      return res.status(400).json({
        status: 'error',
        message: '자신의 계정은 삭제할 수 없습니다.'
      });
    }
    
    // 사용자 관련 데이터 삭제
    await UserRegion.deleteMany({ user_id: user._id });
    await RefreshToken.deleteMany({ user_id: user._id });
    
    // 계정 삭제 로그
    const userLog = new UserLogs({
      event: '계정 삭제',
      IPAddress: getUserIP(req),
      user_id: req.decoded.ID,
      details: `사용자 ${user.ID} 삭제됨`
    });
    await userLog.save();
    
    // 사용자 삭제
    await UserInfo.findByIdAndDelete(user._id);
    
    res.status(200).json({
      status: 'success',
      message: '계정이 성공적으로 삭제되었습니다.'
    });
  } catch (err) {
    console.error('계정 삭제 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 로그아웃
exports.logout = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.query.refreshToken;
    
    if (token) {
      // 리프레시 토큰 무효화
      await RefreshToken.findOneAndUpdate(
        { token },
        { isRevoked: true }
      );
    }
    
    // 로그아웃 로그
    const userLog = new UserLogs({
      event: '로그아웃',
      IPAddress: getUserIP(req),
      user_id: req.decoded.ID
    });
    await userLog.save();
    
    res.status(200).json({
      status: 'success',
      message: '로그아웃 되었습니다.'
    });
  } catch (err) {
    console.error('로그아웃 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 토큰 갱신
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: '리프레시 토큰이 필요합니다.'
      });
    }
    
    // 리프레시 토큰 확인
    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    
    if (!savedToken || savedToken.isRevoked || savedToken.expiresAt < new Date()) {
      return res.status(401).json({
        status: 'error',
        message: '유효하지 않거나 만료된 리프레시 토큰입니다.'
      });
    }
    
    // 사용자 정보 확인
    const user = await UserInfo.findById(savedToken.user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 새 토큰 생성
    const newToken = generateToken(user);
    const newRefreshToken = await generateRefreshToken(user._id);
    
    // 기존 리프레시 토큰 무효화
    savedToken.isRevoked = true;
    await savedToken.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    console.error('토큰 갱신 에러:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};