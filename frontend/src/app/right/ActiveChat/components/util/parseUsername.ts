export default function parseUsername(content: string, username: string) {
  const message = content.split(' ');

  if (message[0] === 'added') {
    const foundUsername = message.slice(1, -3).join(' ');
    return foundUsername === username ? 'added You to the Chat' : content;
  } else if (message[0] === 'made') {
    const foundUsername = message.slice(1, -2).join(' ');
    return foundUsername === username ? 'made You an Admin' : content;
  } else if (message[0] === 'revoked') {
    const foundUsername = message.slice(5).join(' ');
    return foundUsername === username
      ? 'revoked the Admin Role from You'
      : content;
  } else if (message[0] === 'removed') {
    const foundUsername = message.slice(1, -3).join(' ');
    return foundUsername === username ? 'removed You from the Chat' : content;
  } else {
    return content;
  }
}
