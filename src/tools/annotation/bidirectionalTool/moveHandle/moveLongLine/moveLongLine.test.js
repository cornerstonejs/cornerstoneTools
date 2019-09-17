/* eslint-disable no-eval */
import moveLongLine from './moveLongLine';

jest.mock('./../../../../../externalModules.js', () => {
  const intersectLine = eval(
    "(a,b)=>{function sign(x){return typeof x==='number'?x?x<0?-1:1:x===x?0:NaN:NaN}const i={};let x1=a.start.x,y1=a.start.y,x2=a.end.x,y2=a.end.y,x3=b.start.x,y3=b.start.y,x4=b.end.x,y4=b.end.y;let a1,a2,b1,b2,c1,c2;let r1,r2,r3,r4;let d,n;a1=y2-y1;b1=x1-x2;c1=x2*y1-x1*y2;r3=a1*x3+b1*y3+c1;r4=a1*x4+b1*y4+c1;if(r3!==0&&r4!==0&&sign(r3)===sign(r4)){return}a2=y4-y3;b2=x3-x4;c2=x4*y3-x3*y4;r1=a2*x1+b2*y1+c2;r2=a2*x2+b2*y2+c2;if(r1!==0&&r2!==0&&sign(r1)===sign(r2)){return}d=(a1*b2)-(a2*b1);n=(b1*c2)-(b2*c1);const x=parseFloat(n/d);n=(a2*c1)-(a1*c2);const y=parseFloat(n/d);i.x=x;i.y=y;return i}"
  );

  return {
    cornerstoneMath: {
      lineSegment: {
        intersectLine: jest.fn(intersectLine),
      },
    },
  };
});

function createPoint(x, y) {
  return {
    x,
    y,
  };
}

describe('moveLongLine.js', () => {
  it('long line is moved and perpendicular line position is updated', () => {
    const proposedPoint = createPoint(12, 6);

    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 0.5,
      },
    };

    const fixedPoint = measurementData.handles.start;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toEqual(3.9031375531257786);
    expect(perpendicularStart.y).toEqual(6.657455355319679);
    expect(perpendicularEnd.x).toEqual(4.069228512833258);
    expect(perpendicularEnd.y).toEqual(2.671272322340161);
  });

  it('long line is moved and perpendicular line position stays the same', () => {
    const proposedPoint = createPoint(-4, 4);

    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 2,
      },
    };

    const fixedPoint = measurementData.handles.end;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to be moved successfully
    expect(result).toEqual(true);

    // Expect perpendicular lines position to be updated
    expect(perpendicularStart.x).toEqual(4);
    expect(perpendicularStart.y).toEqual(6);
    expect(perpendicularEnd.x).toEqual(4);
    expect(perpendicularEnd.y).toEqual(2);
  });

  it('long line is not moved (proposed point is before intersection point)', () => {
    const proposedPoint = createPoint(3, 6);

    const start = createPoint(0, 4);
    const end = createPoint(8, 4);
    const perpendicularStart = createPoint(4, 6);
    const perpendicularEnd = createPoint(4, 2);

    const measurementData = {
      handles: {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
      },
    };

    const eventData = {
      image: {
        columnPixelSpacing: 1,
        rowPixelSpacing: 0.5,
      },
    };

    const fixedPoint = measurementData.handles.start;

    const result = moveLongLine(
      proposedPoint,
      measurementData,
      eventData,
      fixedPoint
    );

    // Expect line to not be moved
    expect(result).toEqual(false);
  });
});
