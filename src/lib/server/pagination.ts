import { HttpError } from "./http";
export function pageNumber(request:Request) {
  const value=Number(new URL(request.url).searchParams.get("page")??1);
  if(!Number.isSafeInteger(value)||value<1||value>100000) throw new HttpError(400,"Invalid page number.");
  return value;
}
