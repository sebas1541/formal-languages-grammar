"use client";

import { useEffect, useRef } from "react";

interface TreeNode {
  symbol: string;
  children?: TreeNode[];
}

interface DerivationTreeProps {
  tree: TreeNode;
}

export function DerivationTree({ tree }: DerivationTreeProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Clear previous content
    canvasRef.current.innerHTML = "";

    // Calculate tree dimensions
    const nodeWidth = 60;
    const nodeHeight = 40;
    const levelHeight = 80;

    const countLeaves = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
    };

    const getTreeHeight = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getTreeHeight));
    };

    const treeWidth = countLeaves(tree) * nodeWidth * 1.5;
    const treeHeight = getTreeHeight(tree) * levelHeight;

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", Math.max(treeWidth, 400).toString());
    svg.setAttribute("height", Math.max(treeHeight, 300).toString());
    svg.setAttribute("class", "mx-auto");

    // Draw tree recursively
    const drawNode = (
      node: TreeNode,
      x: number,
      y: number,
      level: number,
      parentX?: number,
      parentY?: number
    ): void => {
      // Draw line to parent
      if (parentX !== undefined && parentY !== undefined) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentX.toString());
        line.setAttribute("y1", (parentY + 20).toString());
        line.setAttribute("x2", x.toString());
        line.setAttribute("y2", (y - 20).toString());
        line.setAttribute("stroke", "#94a3b8");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      }

      // Draw node circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", "25");
      circle.setAttribute("fill", node.children && node.children.length > 0 ? "#3b82f6" : "#10b981");
      circle.setAttribute("stroke", "#1e40af");
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);

      // Draw symbol text
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x.toString());
      text.setAttribute("y", (y + 5).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "white");
      text.setAttribute("font-size", "14");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("font-family", "monospace");
      text.textContent = node.symbol === "" ? "ε" : node.symbol;
      svg.appendChild(text);

      // Draw children
      if (node.children && node.children.length > 0) {
        const childWidth = (countLeaves(node) * nodeWidth * 1.5) / node.children.length;
        let childX = x - (countLeaves(node) * nodeWidth * 1.5) / 2 + childWidth / 2;

        node.children.forEach((child) => {
          const childLeaves = countLeaves(child);
          const childCenterOffset = (childLeaves * nodeWidth * 1.5) / 2;
          drawNode(child, childX + childCenterOffset - childWidth / 2, y + levelHeight, level + 1, x, y);
          childX += childLeaves * nodeWidth * 1.5;
        });
      }
    };

    // Start drawing from root
    drawNode(tree, treeWidth / 2, 40, 0);

    canvasRef.current.appendChild(svg);
  }, [tree]);

  return (
    <div className="w-full overflow-x-auto bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div ref={canvasRef} className="min-h-[300px]" />
    </div>
  );
}
