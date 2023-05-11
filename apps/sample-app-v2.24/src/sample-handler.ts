class CustomError extends Error {
  constructor(message?: string) {
    super(message)
    Object.defineProperty(this, 'name', { value: 'CustomError' })
  }
}

export async function myHanlder() {
  throw new CustomError('my error')
}
