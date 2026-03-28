// Game Configuration Constants
export const GAME_CONSTANTS = {
  LANES: 2,
  LANE_WIDTH: 1000,
  ROAD_WIDTH: 2000,
  SEGMENT_LENGTH: 200, 
  RUMBLE_LENGTH: 3, 
  CAMERA_HEIGHT: 1300,
  CAMERA_DEPTH: 0.8, 
  DRAW_DISTANCE: 600, 
  MAX_SPEED: 180,
  ASSETS: {
    ROAD: '/assets/road_texture_png_1774681842105.png',
    BG_CITY: '/assets/background_city_png_1774681793576.png',
    BG_MOUNTAINS: '/assets/background_mountains_png_1774681817805.png',
    PLAYER_BIKE: '/assets/rearview_male.png',
    PLAYER_SCOOTER: '/assets/rearview_female.png',
    TRAFFIC_RICKSHAW: '/assets/rickshaw_rear_png_1774681742742.png',
    TRAFFIC_COW: '/assets/cow_side_png_1774681770231.png',
  },
  ACCEL: 0.8,
  BREAKING: -1.2,
  DECEL: -0.3,
  OFF_ROAD_DECEL: -0.6,
  OFF_ROAD_LIMIT: 2.0,
  NEAR_MISS_DISTANCE: 1.4, 
} as const;

export interface Segment {
  index: number;
  p1: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number } };
  p2: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number } };
  color: { road: string, grass: string, rumble: string, lane?: string };
  sprites: SpriteInstance[];
}

export interface SpriteInstance {
  source: string;
  x: number; // -1 to 1 (left to right)
  z: number;
  scale: number;
  type: 'obstacle' | 'traffic';
}

export interface TrafficInstance {
  id: string;
  lane: number;
  z: number;
  speed: number;
  type: 'car' | 'rickshaw' | 'cow' | 'truck';
  width: number;
  length: number;
  imageIndex?: number; 
  color: string; // Hex code for procedural 3D body
}
