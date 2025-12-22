import { describe, expect, it } from "vitest";
import { buildPageMetadataFromXml } from "../page-metadata";

describe("buildPageMetadataFromXml", () => {
  it("单页面：返回正确的 pages/pageCount/pageNames", () => {
    const xml = `<mxfile><diagram id="diagram-1" name="First"></diagram></mxfile>`;
    const meta = buildPageMetadataFromXml(xml);

    expect(meta.pageCount).toBe(1);
    expect(meta.pageNames).toEqual(["First"]);
    expect(meta.pages).toEqual([{ id: "diagram-1", name: "First", index: 0 }]);
  });

  it("多页面：按顺序返回所有页面信息（属性顺序/引号可变）", () => {
    const xml = [
      `<mxfile>`,
      `<diagram name='Alpha' id="a"></diagram>`,
      `<diagram id='b' name="Beta"></diagram>`,
      `</mxfile>`,
    ].join("");

    const meta = buildPageMetadataFromXml(xml);

    expect(meta.pageCount).toBe(2);
    expect(meta.pageNames).toEqual(["Alpha", "Beta"]);
    expect(meta.pages).toEqual([
      { id: "a", name: "Alpha", index: 0 },
      { id: "b", name: "Beta", index: 1 },
    ]);
  });

  it("缺失 id：自动生成 page-{index+1}", () => {
    const xml = [
      `<mxfile>`,
      `<diagram name="NoId-1"></diagram>`,
      `<diagram id="fixed" name="HasId"></diagram>`,
      `<diagram name="NoId-3"></diagram>`,
      `</mxfile>`,
    ].join("");

    const meta = buildPageMetadataFromXml(xml);

    expect(meta.pages.map((page) => page.id)).toEqual([
      "page-1",
      "fixed",
      "page-3",
    ]);
  });

  it("缺失/空 name：保持向后兼容，自动生成 Page {index+1}", () => {
    const xml = [
      `<mxfile>`,
      `<diagram id="x"></diagram>`,
      `<diagram id="y" name=""></diagram>`,
      `</mxfile>`,
    ].join("");

    const meta = buildPageMetadataFromXml(xml);

    expect(meta.pageCount).toBe(2);
    expect(meta.pageNames).toEqual(["Page 1", "Page 2"]);
    expect(meta.pages).toEqual([
      { id: "x", name: "Page 1", index: 0 },
      { id: "y", name: "Page 2", index: 1 },
    ]);
  });
});
