# testjs

关于 js 的一些功能测试与验证。  
用写测试用例的方式去加深印象.

## 汇总

- [x] [Proxy](__test__/Proxy)
  - [x] [Proxy](__test__/Proxy/Proxy.test.ts) 测试 `Proxy`的基本用法
  - [x] [Vue3](__test__/Proxy/vue3Proxy.test.html) 测试对比 Vue3 修改子对象是否会触发钩子
- [ ] [Object](__test__/Object)
  - [x] [defineProperty](__test__/Object/defineProperty)
    - [x] [defineProperty](__test__/Object/defineProperty/defineProperty.test.ts) 测试 `Object.defineProperty` 的基本用法
    - [x] [vue2](__test__/defineProperty/vue2ArrayLength.test.html) 测试对比 Vue2 修改数组 length 是否会触发钩子
  - [x] [create](__test__/Object/create.test.ts)
        测试 `Object.create` 的基本用法
- [ ] RegExp

  - [x] [具名正则](__test__/RegExp.test.ts)
        测试具名正则用法

- [x] [Generator](__test__/Generator.test.ts)
      测试 `Generator` 生成器基本用法
- [ ] Function
  - [x] [apply](__test__/apply.test.ts)
        测试 `Function.apply` 的伪数组用法

- [ ] Worker