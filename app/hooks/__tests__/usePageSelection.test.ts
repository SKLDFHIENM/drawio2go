import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePageSelection } from "../usePageSelection";

function buildXml(pages: Array<{ id: string; name: string }>) {
  const diagrams = pages
    .map((page) => `<diagram id="${page.id}" name="${page.name}"></diagram>`)
    .join("");
  return `<mxfile>${diagrams}</mxfile>`;
}

function sortIds(ids: Set<string>) {
  return Array.from(ids).sort((a, b) => a.localeCompare(b));
}

describe("usePageSelection", () => {
  it("默认全选：selectedPageIds=全部页面，isAllSelected=true，selectedPageIndices=[]", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    expect(result.current.pages.map((p) => p.id)).toEqual(["a", "b"]);
    expect(sortIds(result.current.selectedPageIds)).toEqual(["a", "b"]);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedPageIndices).toEqual([]);
  });

  it("空 XML：回退到默认单页面，并默认全选", () => {
    const { result } = renderHook(() => usePageSelection({ xml: null }));

    expect(result.current.pages).toEqual([
      { id: "page-1", name: "Page 1", index: 0 },
    ]);
    expect(sortIds(result.current.selectedPageIds)).toEqual(["page-1"]);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedPageIndices).toEqual([]);
  });

  it("XML 变化：部分选择时保留仍存在的选中项，新页面默认不选中", async () => {
    const xml1 = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);
    const xml2 = buildXml([
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ]);

    const { result, rerender } = renderHook(
      ({ xml }) => usePageSelection({ xml }),
      { initialProps: { xml: xml1 } },
    );

    act(() => {
      result.current.setSelectedPageIds(new Set(["b"]));
    });

    rerender({ xml: xml2 });

    await waitFor(() => {
      expect(result.current.pages.map((p) => p.id)).toEqual(["b", "c"]);
      expect(sortIds(result.current.selectedPageIds)).toEqual(["b"]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.selectedPageIndices).toEqual([0]);
    });
  });

  it("XML 变化：全选模式下新增页面应自动选中", async () => {
    const xml1 = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);
    const xml2 = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ]);

    const { result, rerender } = renderHook(
      ({ xml }) => usePageSelection({ xml }),
      { initialProps: { xml: xml1 } },
    );

    expect(result.current.isAllSelected).toBe(true);

    rerender({ xml: xml2 });

    await waitFor(() => {
      expect(result.current.pages.map((p) => p.id)).toEqual(["a", "b", "c"]);
      expect(sortIds(result.current.selectedPageIds)).toEqual(["a", "b", "c"]);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.selectedPageIndices).toEqual([]);
    });
  });

  it("XML 变化：若选中项都消失，允许变为空选", async () => {
    const xml1 = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);
    const xml2 = buildXml([{ id: "b", name: "B" }]);

    const { result, rerender } = renderHook(
      ({ xml }) => usePageSelection({ xml }),
      { initialProps: { xml: xml1 } },
    );

    act(() => {
      result.current.setSelectedPageIds(new Set(["a"]));
    });

    rerender({ xml: xml2 });

    await waitFor(() => {
      expect(result.current.pages.map((p) => p.id)).toEqual(["b"]);
      expect(sortIds(result.current.selectedPageIds)).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.selectedPageIndices).toEqual([]);
    });
  });

  it("selectedPageIndices：部分选中时返回排序后的索引数组", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    act(() => {
      result.current.setSelectedPageIds(new Set(["c", "a"]));
    });

    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.selectedPageIndices).toEqual([0, 2]);
  });

  it("Set 克隆保护：setSelectedPageIds 会克隆并过滤非法 id", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    const ids = new Set<string>(["a", "not-exist"]);
    act(() => {
      result.current.setSelectedPageIds(ids);
    });

    ids.add("b");

    expect(sortIds(result.current.selectedPageIds)).toEqual(["a"]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.selectedPageIndices).toEqual([0]);
  });

  it("setSelectedPageIds：传入空集合时允许空选", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    act(() => {
      result.current.setSelectedPageIds(new Set());
    });

    expect(sortIds(result.current.selectedPageIds)).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.selectedPageIndices).toEqual([]);
  });

  it("togglePage：允许取消到 0 个页面", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    act(() => {
      result.current.setSelectedPageIds(new Set(["a"]));
    });

    act(() => {
      result.current.togglePage("a");
    });

    expect(sortIds(result.current.selectedPageIds)).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.selectedPageIndices).toEqual([]);
  });

  it("toggleAll：全选状态下保持全选不变", () => {
    const xml = buildXml([
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ]);

    const { result } = renderHook(() => usePageSelection({ xml }));

    act(() => {
      result.current.toggleAll();
    });

    expect(sortIds(result.current.selectedPageIds)).toEqual(["a", "b"]);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedPageIndices).toEqual([]);
  });
});
