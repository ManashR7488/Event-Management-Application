import express from 'express';
import {
  createTeam,
  getTeamById,
  addMembers,
  removeMember,
  updateTeam,
  getMyTeams,
} from '../controllers/teamController.js';
import { protect, authorizeTeamLead } from '../middleware/auth.js';

const router = express.Router();

// Protected routes for team leads
router.post('/', protect, authorizeTeamLead, createTeam);
router.get('/my', protect, authorizeTeamLead, getMyTeams);

// Protected routes with authorization handled in controller
router.get('/:id', protect, getTeamById);
router.patch('/:id', protect, updateTeam);
router.patch('/:id/members', protect, addMembers);
router.delete('/:id/members/:memberId', protect, removeMember);

export default router;
