export const findFolderNode = (nodes, targetId) => {
  if (!nodes) return null;

  for (const node of nodes) {
    if (String(node.folderId) === String(targetId)) {
      return node;
    }

    if (node.children) {
      const found = findFolderNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
};
