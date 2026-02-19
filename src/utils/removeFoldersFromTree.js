export const removeFoldersFromTree = (nodes, idsToRemove) => {
  if (!nodes) return [];
  return nodes
    .filter((node) => !idsToRemove.includes(node.folderId))
    .map((node) => ({
      ...node,
      children: node.children
        ? removeFoldersFromTree(node.children, idsToRemove)
        : node.children,
    }));
};
