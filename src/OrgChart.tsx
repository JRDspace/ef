import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./OrgChart.scss";

// Define a Node type
interface Node {
  id: number;
  desc: string;
  children: Node[];
}

const OrgChart: React.FC = () => {
  // Get the URL search parameters safely
  const routerLocation = useLocation();
  const locationSearch = useMemo(() => window.location.search || routerLocation.search, [routerLocation.search]);

  const [tree, setTree] = useState<Node | null>(null);
  const [rootInput, setRootInput] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [loadingNodeId, setLoadingNodeId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<"parent" | "children" | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<{ [key: number]: boolean }>({});
  const [autoSearch, setAutoSearch] = useState<boolean>(false); // Track if search should auto-run

  useEffect(() => {
    const params = new URLSearchParams(locationSearch);
    const eventID = params.get("eventID");
    const tag = params.get("tag");

    if (eventID) {
      setRootInput(eventID);
      if (tag === "share") {
        setAutoSearch(true); // Set auto-search flag
      }
    }
  }, [locationSearch]);

  useEffect(() => {
    if (rootInput && autoSearch) {
      setAutoSearch(false); // Prevents infinite loop
      setRootNode(); // Trigger the search function
    }
  }, [rootInput]); // Removed autoSearch dependency

  const setRootNode = useCallback(async () => {
    console.log("setRootNode triggered with rootInput:", rootInput); // Debugging log
    if (rootInput.trim() === "") {
      alert("Please enter a valid description for the root node.");
      return;
    }
  
    setSearchLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    setTree({
      id: Date.now(),
      desc: rootInput,
      children: [],
    });
  
    setSearchLoading(false);
  }, [rootInput]);
   // Now it has stable dependencies
  

  const addChildNodes = async (parentId: number) => {
    setLoadingNodeId(parentId);
    setLoadingAction("children");

    const numChildren = parseInt(prompt("How many child nodes do you want to add?") || "0", 10);
    if (isNaN(numChildren) || numChildren <= 0) {
      setLoadingNodeId(null);
      setLoadingAction(null);
      return;
    }

    const newChildren: Node[] = [];
    for (let i = 0; i < numChildren; i++) {
      const desc = prompt(`Enter description for child ${i + 1}`) || "Node";
      newChildren.push({
        id: Date.now() + Math.random(),
        desc,
        children: [],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const updateTree = (node: Node): Node => {
      if (node.id === parentId) {
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(updateTree) };
    };

    setTree((prevTree) => (prevTree ? updateTree(prevTree) : null));
    setLoadingNodeId(null);
    setLoadingAction(null);
  };

  const addParentNode = async (childId: number) => {
    setLoadingNodeId(childId);
    setLoadingAction("parent");

    const parentDesc = prompt("Enter description for the new parent node:") || "Parent Node";

    const newParent: Node = {
      id: Date.now() + Math.random(),
      desc: parentDesc,
      children: [],
    };

    const updateTree = (node: Node): Node | null => {
      if (node.id === childId) {
        newParent.children = [{ ...node }];
        return newParent;
      }
      return {
        ...node,
        children: node.children.map(updateTree).filter(Boolean) as Node[],
      };
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (tree) {
      const newTree = updateTree(tree);
      if (newTree) {
        setTree(newParent);
      }
    }
    setLoadingNodeId(null);
    setLoadingAction(null);
  };

  const toggleDetails = (nodeId: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderTree = (node: Node) => (
    <li key={node.id} className="node-box">
      <span data-desc={node.desc.toLowerCase()} className="node-content">
        <button
          className="node_button"
          onClick={(e) => {
            e.stopPropagation();
            addParentNode(node.id);
          }}
          disabled={loadingNodeId === node.id}
        >
          {loadingNodeId === node.id && loadingAction === "parent" ? "Please Wait..." : "Add Parent"}
        </button>

        <button
          className="node_button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDetails(node.id);
          }}
        >
          {expandedNodes[node.id] ? "Hide Details" : "Show Details"}
        </button>

        {expandedNodes[node.id] && (
          <div className="details fade-in" data-desc={node.desc.toLowerCase()}>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Node ID</td>
                  <td>{node.id}</td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>{node.desc}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <button
          className="node_button"
          onClick={(e) => {
            e.stopPropagation();
            addChildNodes(node.id);
          }}
          disabled={loadingNodeId === node.id}
        >
          {loadingNodeId === node.id && loadingAction === "children" ? "Please Wait..." : "Add Children"}
        </button>
      </span>

      {node.children.length > 0 && <ul>{node.children.map((child) => renderTree(child))}</ul>}
    </li>
  );

  return (
    <figure className={`etools_eventflow ${tree ? "tree-visible" : ""}`}>
      <div className="logo">EventFlow</div>
      <div className="input-container">
        <input
          type="text"
          value={rootInput}
          onChange={(e) => setRootInput(e.target.value)}
          placeholder="Event ID"
          disabled={searchLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setRootNode();
            }
          }}
        />
        <button onClick={setRootNode} id="search" disabled={searchLoading}>
          {searchLoading ? "Please Wait..." : "Search"}
        </button>
      </div>
      {tree && <ul className="tree">{renderTree(tree)}</ul>}
    </figure>
  );
};

export default OrgChart;
