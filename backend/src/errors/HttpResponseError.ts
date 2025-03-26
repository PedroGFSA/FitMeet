export default class HttpResponseError extends Error {

  constructor(public readonly statusCode: number, message: string, public info?: string) {
    super(message);
  }
}