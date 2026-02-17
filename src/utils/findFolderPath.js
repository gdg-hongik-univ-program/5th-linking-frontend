export const findFolderPath = (nodes, targetId) => {
  if (!nodes || !targetId) return null;

  for (const node of nodes) {
    if (String(node.folderId) === String(targetId)) {
      return [node.folderName];
    }

    if (node.children) {
      const childPath = findFolderPath(node.children, targetId);
      if (childPath) {
        return [node.folderName, ...childPath];
      }
    }
  }
  return null;
};
