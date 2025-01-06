import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./EventChart.scss";

const EventChart = () => {
  const locationSearch = useMemo(() => window.location.search, []);
  const [tree, setTree] = useState(null);
  const [rootInput, setRootInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [autoSearch, setAutoSearch] = useState(false);
  const [firstSearchedNodeId, setFirstSearchedNodeId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(locationSearch);
    const eventID = params.get("eventID");
    const tag = params.get("tag");

    if (eventID) {
      setRootInput(eventID);
      if (tag === "share") {
        setAutoSearch(true);
      }
    }
  }, [locationSearch]);

  useEffect(() => {
    if (rootInput && autoSearch) {
      setAutoSearch(false);
      setRootNode();
    }
  }, [rootInput]);
  const setRootNode = useCallback(async () => {
    if (rootInput.trim() === "") {
      alert("Please enter a valid description for the root node.");
      return;
    }
  
    setSearchLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    const newTree = {
      id: Date.now(),
      desc: rootInput,
      children: [],
    };
  
    setTree(newTree);
  
    // ✅ Ensure the label is always applied to the latest search result
    setFirstSearchedNodeId(newTree.id);
  
    setSearchLoading(false);
  }, [rootInput]);
  
  

  const addChildNodes = async (parentId) => {
    setLoadingNodeId(parentId);
    setLoadingAction("children");

    const numChildren = parseInt(prompt("How many child nodes do you want to add?") || "0", 10);
    if (isNaN(numChildren) || numChildren <= 0) {
      setLoadingNodeId(null);
      setLoadingAction(null);
      return;
    }

    const newChildren = [];
    for (let i = 0; i < numChildren; i++) {
      const desc = prompt(`Enter description for child ${i + 1}`) || "Node";
      newChildren.push({
        id: Date.now() + Math.random(),
        desc,
        children: [],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const updateTree = (node) => {
      if (node.id === parentId) {
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(updateTree) };
    };

    setTree((prevTree) => (prevTree ? updateTree(prevTree) : null));
    setLoadingNodeId(null);
    setLoadingAction(null);
  };

  const addParentNode = async (childId) => {
    setLoadingNodeId(childId);
    setLoadingAction("parent");

    const parentDesc = prompt("Enter description for the new parent node:") || "Parent Node";

    const newParent = {
      id: Date.now() + Math.random(),
      desc: parentDesc,
      children: [],
    };

    const updateTree = (node) => {
      if (node.id === childId) {
        newParent.children = [{ ...node }];
        return newParent;
      }
      return {
        ...node,
        children: node.children.map(updateTree).filter(Boolean),
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

  const toggleDetails = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderTree = (node) => (
    <li key={node.id} className="node-box">
      <span className="node-content">
        {node.id === firstSearchedNodeId && <div className="flow-start">FLOW STARTED HERE</div>}
  
        <button className="node_button" onClick={() => addParentNode(node.id)} disabled={loadingNodeId === node.id}>
          {loadingNodeId === node.id && loadingAction === "parent" ? "Please Wait..." : "Add Parent"}
        </button>
  
        <button className="node_button" onClick={() => toggleDetails(node.id)}>
          {expandedNodes[node.id] ? "Hide Details" : "Show Details"}
        </button>
  
        {expandedNodes[node.id] && (
          <div className="details fade-in">
            <table>
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
  
        <button className="node_button" onClick={() => addChildNodes(node.id)} disabled={loadingNodeId === node.id}>
          {loadingNodeId === node.id && loadingAction === "children" ? "Please Wait..." : "Add Children"}
        </button>
      </span>
  
      {node.children.length > 0 && <ul>{node.children.map((child) => renderTree(child))}</ul>}
    </li>
  );
  
  

  return (
    <div className="etools_eventflow">
      <div className="mainDiv">
        <div className="inputDiv">
          <div className="logo">EventFlow</div>
          <div className="input-container">
            <input
              type="text"
              value={rootInput}
              onChange={(e) => setRootInput(e.target.value)}
              placeholder="Event ID"
              onKeyDown={(e) => e.key === "Enter" && setRootNode()}
            />
            <button onClick={setRootNode} id="search">{searchLoading ? "Please Wait..." : "Search"}</button>
          </div>
        </div>
        <div className={`${tree ? "tree-visible" : ""}`}>
          {tree && <ul className="tree">{renderTree(tree)}</ul>}
        </div>
      </div>
    </div>
  );
};

export default EventChart;
