import { describe, it, expect } from "vitest";
import { Singleton } from "../dist";
describe("design-patterns", () => {
    it("should get only one", () => {
        const one = new Singleton<number>();
        const instance = 1;
        one.then((num) => {
            expect(num).toEqual(instance)
        })
        one.set(instance);
        one.then((num) => {
            expect(num).toEqual(instance)
        })

    })
})