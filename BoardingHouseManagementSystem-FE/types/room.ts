export interface Room {
  id: number;
  buildingId: number;
  buildingName: string;
  roomNumber: string;
  price: number;
  area: number;
  maxOccupants: number;
  status: string;
  description: string;
  amenities: string;
  createdAt: string;
  imageUrls: string[];
}
