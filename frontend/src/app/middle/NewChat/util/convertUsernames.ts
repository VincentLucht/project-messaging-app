export default function convertUsernames(
  usernames: string,
  isGroupChat: boolean,
) {
  if (!isGroupChat) {
    const usernamesArr = [];
    usernamesArr.push(usernames);
    return usernamesArr;
  }

  const splitUsernames = usernames
    .split(',')
    .map((username) => username.trim())
    .filter(Boolean);

  return splitUsernames;
}
