import { useState, useEffect } from "react";
import { Tree } from "antd";
import api from "../utils/api";

function DriveTree({ onSelect, treeData, setTreeData, loading, setLoading }) {
  // ambil daftar drive saat pertama kali load
  const getDrives = async () => {
    try {
      setLoading(true);
      const res = await api.get("/songs/drives");
      setTreeData(res.treeData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getDrives();
  }, []);
  // helper untuk update node di treeData
  const updateTreeData = (list, key, children) =>
    list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });

  // fungsi untuk lazy load children
  const onLoadData = async (node) => {
    const res = await api.get(`/songs/folder?folderPath=${node.key}`);

    setTreeData((origin) => updateTreeData(origin, node.key, res.children));
  };

  return (
    <Tree
      treeData={treeData}
      loadData={onLoadData}
      onSelect={onSelect}
      // onDoubleClick={(event, node) => {
      //   // panggil handler dari parent
      //   if (onSelect) {
      //     onSelect(node);
      //   }
      // }}
    />
  );
}

export default DriveTree;
