export type RoomRedisParams = {
  creator: string;
  players: string[];
  isRoomFull: boolean;
  boardID: string;
};

export enum PlayerRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
}

export enum RedisKey {
  ROOMS = 'room',
}
