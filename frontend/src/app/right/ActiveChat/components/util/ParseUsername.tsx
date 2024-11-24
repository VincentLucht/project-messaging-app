export default function parseUsername(
  messageContent: string,
  username: string,
  mode: 'message' | 'last-message',
) {
  const tabooWords = ['added', 'to', 'the', 'Chat'];
  const words = messageContent.split(' ');

  const usernameSplit: string[] = [];
  words.forEach((word) => {
    if (!tabooWords.includes(word)) {
      usernameSplit.push(word);
    }
  });
  const foundUsername = usernameSplit.join(' ');

  if (mode === 'last-message') {
    return foundUsername === username ? 'You' : foundUsername;
  }

  return (
    <span className="font-bold">
      {foundUsername === username ? 'You' : foundUsername}
    </span>
  );
}
