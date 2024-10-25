export default function generateTempId() {
  const temporaryId = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  return temporaryId;
}
