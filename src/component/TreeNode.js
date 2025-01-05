import React from "react";

const TreeNode = ({ node, addChildNodes, addParentNode, renderTree }) => (
  <li key={node.id}>
    <span
      onClick={() => alert(`Node description: ${node.desc}`)}
      style={{ cursor: "pointer" }}
    >
      {node.desc}
      <br />
      <button onClick={(e) => { e.stopPropagation(); addChildNodes(node.id); }}>
        Add Children
      </button>
      <button onClick={(e) => { e.stopPropagation(); addParentNode(node.id); }}>
        Add Parent
      </button>
    </span>
    {node.children.length > 0 && (
      <ul>{node.children.map((child) => renderTree(child))}</ul>
    )}
  </li>
);

export default TreeNode;
