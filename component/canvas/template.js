export default class template {
  palette(data) {
    return ({
      width: '380px',
      height: '380px',
      background:data.picUrl,
      views: [
        {
          type:'rect',
          css: {
            width:'380px',
            height:'380px',
            color: '#0000004D'
          }
        },
        {
          type:'text',
          text:'- JayChou杰伦粉丝圈 -',
          css:{
            bottom:'30px',
            width: '380px',
            height: '30px',
            fontSize: '24rpx',
            color: 'white',
            textAlign:'center'
          }
        },
        {
          type:'text',
          text:data.name+ " · " +data.singer,
          css:{
            bottom:'50px',
            width: '380px',
            height: '30px',
            fontSize: '24rpx',
            color: 'white',
            textAlign:'center'
          }
        },
        {
          type:'text',
          text:data.lyrics,
          css:{
            top:'80px',
            left: '10px',
            right: '10px',
            width: '360px',
            height: '250px',
            fontSize: '38rpx',
            lineHeight: '60rpx',
            color: 'white',
            textAlign:'center'
          }
        },
        ]
    })
  }
}

