/* There are going to be many times where we want to return user info associated with a resource (Blueprint, Component, etc.)
   Building this method so that I can avoid writing the same JSON block of user info over and over.*/
interface GetUserInfoReturn {
  username: string;
  displayName: string;
}
type GetUserInfo = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelInstance: any,
  key: string,
) => void | GetUserInfoReturn;
export const getUserInfo: GetUserInfo = (modelInstance, key) => {
  const userInfo = modelInstance[key];
  if (!userInfo) {
    return;
  }

  return {
    username: userInfo.username,
    displayName: userInfo.displayName,
  };
};
