import { cn } from "./utils";

describe("cn", () => {
  it("resolves conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy conditional classes", () => {
    expect(cn("text-ink", false, undefined, "font-bold")).toBe("text-ink font-bold");
  });
});
