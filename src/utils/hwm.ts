import { TDirectional } from '@/types';

export interface ISupply {
  _id: string;
  age?: number;
  gender?: 'man' | 'woman';
  location?: string;
  count: number;
}

export interface IDemand {
  ads_id: string;
  age?: number[];
  gender?: 'man' | 'woman';
  location?: string[];
  ads_amount: number;
  payments: number;
}

interface IDirectionFlow {
  [propName: string]: {
    flows: ISupply[];
    ads_amount: number;
    payments: number;
  };
}

interface IOrder {
  ads_id: string;
  S: number;
  flows: ISupply[];
  ads_amount: number;
  payments: number;
}

// const supplies: ISupply[] = [
//   { _id: 's1', age: 25, gender: 'man', count: 400 },
//   { _id: 's2', age: 25, gender: 'man', location: '北京', count: 400 },
//   { _id: 's3', age: 25, gender: 'man', location: '南京', count: 100 },
//   { _id: 's4', age: 25, location: '南京', count: 100 },
//   { _id: 's5', age: 25, location: '上海', count: 500 },
//   { _id: 's6', age: 25, count: 300 },
// ];

// const demands: IDemand[] = [
//   { ads_id: 'ad1', gender: 'man', ads_amount: 200 },
//   { ads_id: 'ad2', location: ['南京'], ads_amount: 500 },
//   { ads_id: 'ad3', age: [25, 25], ads_amount: 1000 },
// ];

// const candidates: IDemand[] = [
//   { ads_id: 'ad2', location: ['南京'], ads_amount: 500 },
// ];

// 获得符合年龄区间的流量
const getMatchAgeItem = (target: any[], match: number[]) => {
  const min = match[0];
  const max = match[1];
  return target.filter((i) => {
    if (i.age) {
      return i.age >= min && i.age <= max;
    }
  });
};

// 获得符合地域区间的流量
const getMatchLocationItem = (target: any[], match: string[]) => {
  return target.filter((i) => {
    if (i.location) {
      return match.includes(i.location);
    }
  });
};

// 获得符合性别的流量
const getMatchGenderItem = (target: any[], match: 'man' | 'woman') => {
  return target.filter((i) => {
    if (i.gender) {
      return i.gender === match;
    }
  });
};

const getMatchItem = (arr1: ISupply[], arr2: ISupply[], arr3: ISupply[]) => {
  const intersection1 = arr1.filter((i) => arr2.some((j) => j._id === i._id));
  return intersection1.filter((i) => arr3.some((j) => j._id === i._id));
};

export const getDirectionFlow = (demands: IDemand[], supplies: ISupply[]) => {
  const res: IDirectionFlow = {};
  demands.forEach((demand) => {
    let ageRes = supplies;
    let locationRes = supplies;
    let genderRes = supplies;
    if (demand.age) {
      ageRes = getMatchAgeItem(supplies, demand.age);
    }
    if (demand.location) {
      locationRes = getMatchLocationItem(supplies, demand.location);
    }
    if (demand.gender) {
      genderRes = getMatchGenderItem(supplies, demand.gender);
    }
    res[demand.ads_id] = {
      flows: getMatchItem(locationRes, genderRes, ageRes),
      ads_amount: demand.ads_amount,
      payments: demand.payments,
    };
  });
  return res;
};

const getOrder = (demands: IDemand[], supplies: ISupply[]) => {
  const directionFlows = getDirectionFlow(demands, supplies);
  // console.log(directionFlows);
  const res: IOrder[] = [];
  for (const i in directionFlows) {
    res.push({
      ads_id: i,
      S: directionFlows[i].flows.map((j) => j.count).reduce((a, b) => a + b, 0),
      flows: directionFlows[i].flows,
      ads_amount: directionFlows[i].ads_amount,
      payments: directionFlows[i].payments,
    });
  }
  return res.sort((a, b) => {
    if (a.S === b.S) {
      return b.payments - a.payments;
    } else {
      return a.S - b.S;
    }
  });
};

const getRemainsSum = (ids: string[], remains: ISupply[]) => {
  return remains
    .filter((i) => ids.includes(i._id))
    .map((j) => j.count)
    .reduce((a, b) => a + b, 0);
};

interface IRate {
  ads_id: string;
  rate: number;
  ads_amount: number;
  payments: number;
}
interface IOrderRes {
  ads_id: string;
}
export const hwmPlan = (demands: IDemand[], supplies: ISupply[]) => {
  const orders = getOrder(demands, supplies);
  console.log(orders);
  const rates = new Map();

  const remains = supplies;
  for (let i = 0; i < orders.length; i++) {
    const demand = orders[i];
    for (let j = 0; j < demand.flows.length; j++) {
      const targetFlowIndex = remains.findIndex(
        (remain) => remain._id === demand.flows[j]._id,
      );
      const total_remain = getRemainsSum(
        demand.flows.map((k) => k._id),
        remains,
      );
      if (total_remain < demand.ads_amount) {
        rates.set(demand.ads_id, {
          rate: 1.0,
          ads_amount: demand.ads_amount,
          payments: demand.payments,
        });
      } else {
        rates.set(demand.ads_id, {
          rate: demand.ads_amount / total_remain,
          ads_amount: demand.ads_amount,
          payments: demand.payments,
        });
      }
      remains[targetFlowIndex].count =
        remains[targetFlowIndex].count * (1 - rates.get(demand.ads_id).rate);
      // console.log(remains[targetFlowIndex].count);
    }
  }
  const rates_res: IRate[] = [];
  rates.forEach((value, key) => {
    rates_res.push({
      ads_id: key,
      rate: value.rate,
      ads_amount: value.ads_amount,
      payments: value.payments,
    });
  });
  const orders_res: IOrderRes[] = [];
  orders.forEach((i) => {
    orders_res.push({ ads_id: i.ads_id });
  });
  return {
    rates: rates_res,
    orders: orders_res,
  };
};

export const hwmServe = (
  candidates: IDemand[],
  orders: IOrderRes[],
  rates: IRate[],
) => {
  // console.log('------rates------');
  // console.log(rates);
  // console.log('+++++++++++++++++');
  // console.log('------orders------');
  // console.log(orders);
  // console.log('+++++++++++++++++');
  const orderNum = orders.length;
  const _candidates: any = candidates
    .map((i) => {
      return {
        ads_id: i.ads_id,
        rate: rates.find((j) => j.ads_id == i.ads_id)?.rate,
        order: orderNum - orders.findIndex((k) => k.ads_id == i.ads_id),
        ads_amount: rates.find((j) => j.ads_id == i.ads_id)?.ads_amount,
        payments: rates.find((j) => j.ads_id == i.ads_id)?.payments,
      };
    })
    .sort((a, b) => b.order * b.payments - a.order * a.payments);
  console.log(_candidates);
  // const randValue = Math.random();
  console.log(_candidates);
  const accuRate = _candidates
    .map((i: any) => i.rate)
    .reduce((a: any, b: any) => a + b, 0);
  if (_candidates.length) {
    if (accuRate > 1) {
      let _accuRate = 0;
      let l = 0;
      for (let i = 0; i < _candidates.length; i++) {
        _accuRate = _accuRate + _candidates[i].rate;
        if (_accuRate === 1) {
          l = i;
          break;
        }
        if (_accuRate > 1) {
          l = i - 1;
          break;
        }
      }
      return _candidates[l].ads_id;
    } else {
      return _candidates[0].ads_id;
    }
  } else {
    return '';
  }
};

interface IDirectional {
  age: number;
  gender: string;
  location: string;
}
export const getCandidates = (
  directional: IDirectional,
  demands: IDemand[] = [],
) => {
  console.log(directional);
  // console.log(demands);
  return demands.filter((demand) => {
    let match = 0;
    if (!demand.age) {
      match += 1;
    } else {
      const minAge = demand?.age[0];
      const maxAge = demand?.age[1];
      if (directional.age >= minAge && directional.age <= maxAge) {
        match += 1;
      }
    }
    if (!demand?.location || demand.location.includes(directional.location)) {
      match += 1;
    }
    if (!demand?.gender || directional.gender === demand.gender) {
      match += 1;
    }
    return match === 3;
  });
};
