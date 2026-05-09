import type { GovernorDTO } from '../types/governor.dto';
import type { Governor } from '../types/governor.model';

export function toGovernor(dto: GovernorDTO): Governor {
  return {
    userId: dto.user_id,
    username: dto.username,
    email: dto.email,
  };
}
