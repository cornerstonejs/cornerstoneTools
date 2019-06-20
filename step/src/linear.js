class Linear {
  // Linear algebra helpers
  constructor(options={}) {
  }
}

Linear.LARGE_NUMBER = 3e38;
Linear.SMALL_NUMBER = 2e-38;

Linear.vclone = function(v) {
  return(v.slice(0));
}

Linear.vlength = function(v) {
  return(Math.sqrt(v.map(e=>e*e).reduce((sum,value)=>sum+value)));
}

Linear.vnormalize = function(v) {
  return(Linear.vscale(v, 1./Linear.vlength(v)));
}

Linear.vdistance = function(v1, v2) {
  return(Linear.vlength(Linear.vminus(v2, v1)));
}

Linear.vplus = function(v1, v2) {
  return([v1[0]+v2[0],v1[1]+v2[1],v1[2]+v2[2]]);
}

Linear.vminus = function(v1, v2) {
  return([v1[0]-v2[0],v1[1]-v2[1],v1[2]-v2[2]]);
}

Linear.vscale = function(v1, scale) {
  return([v1[0]*scale,v1[1]*scale,v1[2]*scale]);
}

Linear.vcross = function(v1, v2) {
  return([v1[1]*v2[2] - v1[2]*v2[1],
          v1[2]*v2[0] - v1[0]*v2[2],
          v1[0]*v2[1] - v1[1]*v2[0]]);
}

Linear.vdot = function(v1, v2) {
  return([v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]]);
}

Linear.midentity = function() {
  return ([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);
}

Linear.mtranslate = function(v) {
  return ([[1,0,0,0],[0,1,0,0],[0,0,1,0],[v[0],v[1],v[2],1]]);
}

Linear.mscale = function(v) {
  return ([[v[0],0,0,0],[0,v[1],0,0],[0,0,v[2],0],[0,0,0,1]]);
}

// return a matrix to rotate a point around the axis by angle
// axis must be normalized
// angle is in degrees
// https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
Linear.mrotate = function(u, theta) {
  let T = theta * Math.PI/180.;
  let cT = Math.cos(T);
  let sT = Math.sin(T);
  return ([
    [cT+u[0]*u[0]*(1-cT), u[1]*u[0]*(1-cT)+u[2]*sT, u[2]*u[0]*(1-cT)-u[1]*sT, 0],
    [u[0]*u[1]*(1-cT)-u[2]*sT, cT+u[1]*u[1]*(1-cT), u[2]*u[1]*(1-cT)+u[0]*sT, 0],
    [u[0]*u[2]*(1-cT)+u[1]*sT, u[1]*u[2]*(1-cT)-u[0]*sT, cT+u[2]*u[2]*(1-cT), 0],
    [0, 0, 0, 1]
  ]);
}

Linear.mmultiply = function(m1, m2) {
  return ([
    [m1[0][0]*m2[0][0]+m1[1][0]*m2[0][1]+m1[2][0]*m2[0][2]+m1[3][0]*m2[0][3],
     m1[0][1]*m2[0][0]+m1[1][1]*m2[0][1]+m1[2][1]*m2[0][2]+m1[3][1]*m2[0][3],
     m1[0][2]*m2[0][0]+m1[1][2]*m2[0][1]+m1[2][2]*m2[0][2]+m1[3][2]*m2[0][3],
     m1[0][3]*m2[0][0]+m1[1][3]*m2[0][1]+m1[2][3]*m2[0][2]+m1[3][3]*m2[0][3]],
    [m1[0][0]*m2[1][0]+m1[1][0]*m2[1][1]+m1[2][0]*m2[1][2]+m1[3][0]*m2[1][3],
     m1[0][1]*m2[1][0]+m1[1][1]*m2[1][1]+m1[2][1]*m2[1][2]+m1[3][1]*m2[1][3],
     m1[0][2]*m2[1][0]+m1[1][2]*m2[1][1]+m1[2][2]*m2[1][2]+m1[3][2]*m2[1][3],
     m1[0][3]*m2[1][0]+m1[1][3]*m2[1][1]+m1[2][3]*m2[1][2]+m1[3][3]*m2[1][3]],
    [m1[0][0]*m2[2][0]+m1[1][0]*m2[2][1]+m1[2][0]*m2[2][2]+m1[3][0]*m2[2][3],
     m1[0][1]*m2[2][0]+m1[1][1]*m2[2][1]+m1[2][1]*m2[2][2]+m1[3][1]*m2[2][3],
     m1[0][2]*m2[2][0]+m1[1][2]*m2[2][1]+m1[2][2]*m2[2][2]+m1[3][2]*m2[2][3],
     m1[0][3]*m2[2][0]+m1[1][3]*m2[2][1]+m1[2][3]*m2[2][2]+m1[3][3]*m2[2][3]],
    [m1[0][0]*m2[3][0]+m1[1][0]*m2[3][1]+m1[2][0]*m2[3][2]+m1[3][0]*m2[3][3],
     m1[0][1]*m2[3][0]+m1[1][1]*m2[3][1]+m1[2][1]*m2[3][2]+m1[3][1]*m2[3][3],
     m1[0][2]*m2[3][0]+m1[1][2]*m2[3][1]+m1[2][2]*m2[3][2]+m1[3][2]*m2[3][3],
     m1[0][3]*m2[3][0]+m1[1][3]*m2[3][1]+m1[2][3]*m2[3][2]+m1[3][3]*m2[3][3]]
  ]);
}

Linear.mvmultiply = function(m, v) {
  return ([
    m[0][0]*v[0]+m[1][0]*v[1]+m[2][0]*v[2]+m[3][0]*v[3],
    m[0][1]*v[0]+m[1][1]*v[1]+m[2][1]*v[2]+m[3][1]*v[3],
    m[0][2]*v[0]+m[1][2]*v[1]+m[2][2]*v[2]+m[3][2]*v[3],
    m[0][3]*v[0]+m[1][3]*v[1]+m[2][3]*v[2]+m[3][3]*v[3]
  ]);
}
