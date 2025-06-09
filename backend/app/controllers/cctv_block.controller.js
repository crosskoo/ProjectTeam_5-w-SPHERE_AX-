// app/controllers/cctv_block.controller.js
'use strict';

const rateLimiter = require('../services/event_rate_limiter');
const mongoose = require('mongoose');
const CCTV = mongoose.model('CCTV');

// CCTV 차단 상태 조회
const getBlockStatus = async (req, res) => {
  try {
    const { cctvId } = req.params;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId).select('name');
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    const blockStatus = rateLimiter.getStatus(cctvId);
    
    res.status(200).json({
      status: 'success',
      data: {
        cctvId,
        cctvName: cctv.name,
        isBlocked: blockStatus.isBlocked,
        remainingTime: blockStatus.remainingTime
      }
    });
  } catch (err) {
    console.error('CCTV 차단 상태 조회 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// CCTV 차단 해제
const unblockCCTV = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 차단을 해제할 수 있습니다.'
      });
    }
    
    const { cctvId } = req.params;
    
    // CCTV 존재 확인
    const cctv = await CCTV.findById(cctvId).select('name');
    if (!cctv) {
      return res.status(404).json({
        status: 'error',
        message: 'CCTV를 찾을 수 없습니다.'
      });
    }
    
    const result = rateLimiter.unblock(cctvId);
    
    if (result) {
      console.log(`관리자 ${req.decoded.username}이 CCTV ${cctv.name}(${cctvId}) 차단 해제`);
      
      res.status(200).json({
        status: 'success',
        message: `${cctv.name} CCTV의 차단이 해제되었습니다.`,
        data: {
          cctvId,
          cctvName: cctv.name,
          unblockedBy: req.decoded.username,
          timestamp: new Date()
        }
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: '해당 CCTV는 차단되지 않은 상태입니다.'
      });
    }
  } catch (err) {
    console.error('CCTV 차단 해제 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 모든 CCTV 차단 상태 조회
const getAllBlockStatus = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.decoded.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: '관리자만 접근할 수 있습니다.'
      });
    }
    
    // 모든 CCTV 조회
    const cctvs = await CCTV.find({}).select('name');
    const result = [];
    
    cctvs.forEach(cctv => {
      const status = rateLimiter.getStatus(cctv._id.toString());
      if (status.isBlocked) {
        result.push({
          cctvId: cctv._id,
          cctvName: cctv.name,
          isBlocked: status.isBlocked,
          remainingTime: status.remainingTime
        });
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        blockedCCTVs: result,
        totalBlocked: result.length
      }
    });
  } catch (err) {
    console.error('전체 CCTV 차단 상태 조회 오류:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 각 함수를 개별적으로 export
exports.getBlockStatus = getBlockStatus;
exports.unblockCCTV = unblockCCTV;
exports.getAllBlockStatus = getAllBlockStatus;