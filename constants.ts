import { Mission, MissionStatus, MissionType, User, UserRole } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  trustScore: 85,
  impactCredits: 1250,
  role: UserRole.VERIFIED_VOLUNTEER,
  badges: ['Early Adopter', 'Fixer', 'Good Listener']
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    type: MissionType.FIX_BOUNTY,
    title: 'Broken Streetlight',
    description: 'Streetlight #402 is flickering heavily, causing visibility issues.',
    location: '4th & Main St',
    distance: '0.1 mi',
    reward: 50,
    status: MissionStatus.OPEN,
    urgency: 'MEDIUM',
    timeEstimate: '5 min',
    fixData: {
      severity: 'Medium',
      imageUrl: 'https://picsum.photos/id/212/800/600'
    }
  },
  {
    id: 'm5',
    type: MissionType.FIX_BOUNTY,
    title: 'Community Garden Cleanup',
    description: 'Heavy lifting required to clear storm debris from the walkway.',
    location: 'Central Park',
    distance: '0.3 mi',
    reward: 150,
    status: MissionStatus.OPEN,
    urgency: 'MEDIUM',
    timeEstimate: '45 min',
    squadSize: 3,
    currentSquad: 1,
    fixData: {
      severity: 'Medium',
      imageUrl: 'https://picsum.photos/id/118/800/600'
    }
  },
  {
    id: 'm2',
    type: MissionType.FOOD_FIT,
    title: 'Surplus Bagels',
    description: '2 dozen fresh bagels from staff meeting. Sealed.',
    location: 'Community Center',
    distance: '0.4 mi',
    reward: 30,
    status: MissionStatus.OPEN,
    urgency: 'HIGH',
    timeEstimate: '20 min',
    foodData: {
      allergens: ['Gluten', 'Sesame'],
      expiry: 'Today 5pm'
    }
  },
  {
    id: 'm3',
    type: MissionType.LONELY_MINUTES,
    title: 'Afternoon Check-in',
    description: 'Mrs. Higgins would love a 10-minute chat about gardening.',
    location: 'Oak Street Apartments',
    distance: '0.8 mi',
    reward: 100,
    status: MissionStatus.OPEN,
    urgency: 'LOW',
    timeEstimate: '15 min',
    lonelyData: {
      topic: 'Gardening',
      mode: 'CALL'
    }
  },
  {
    id: 'm4',
    type: MissionType.LIFE_SKILL,
    title: 'Safe Lifting Tech',
    description: 'Learn how to lift heavy boxes safely using AR overlay.',
    location: 'Digital',
    distance: 'N/A',
    reward: 20,
    status: MissionStatus.OPEN,
    urgency: 'LOW',
    timeEstimate: '3 min',
    skillData: {
      moduleName: 'Ergonomics 101',
      arOverlay: true
    }
  }
];

export const MOCK_GEO_COORDS = {
  latitude: 37.7749,
  longitude: -122.4194
};