export class AppError extends Error {
  constructor(
    public override message: string,
    public status: number = 500,
    public code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
