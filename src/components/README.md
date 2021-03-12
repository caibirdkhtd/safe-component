### 文件内容
- 该模块下放置的是已经编译好的组件内容。
- 编译方式为: 在原有vue-cli 环境下正常编写组件，用'npm run build' 进行构建后，将相应的代码片段取出，放置在该文件夹下
- ./src 下放置的是对应的源文件， 不过目前无法在safe-components 下完成编译，供代码参考和后续修改使用
- 目前该模块下的组件使用jsx所写，模块下不包含对应样式文件。样式文件位于/assets/components/{组件名}.less 中。引用时可在引用的文件或上级文件中引入
```
  @import '~safe-component/assets/components/{组件名}.less';
```

### 组件列表
#### ImageGroup
用于图片（和视频首页）缩略图的显示, 可选择是否显示删除按钮。
使用方式
```
  <image-group
    :img-list="scope.row.attaches"
    :showDeleteBtn='true'
    @display-image="displayImage"
    @remove-image='removeImage'
  ></image-group>
```
