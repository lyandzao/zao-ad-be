export class AppDTO {
  readonly app_name: string;
  readonly app_status: string;
  readonly shield: string; // encode
  readonly industry: number;
}

export class UpdateAppDTO {
  readonly app_id: string;
  readonly app_name: string;
  readonly shield: string; // encode
  readonly industry: number;
}
