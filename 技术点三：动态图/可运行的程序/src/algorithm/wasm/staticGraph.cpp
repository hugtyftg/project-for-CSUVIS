#include "staticGraph.h"
#include <emscripten.h>

// 节点初始位置(x,y)[2], 额外信息：是否随即初始位置[1]
// 连边涉及节点(x,y)[2]
#ifdef __cplusplus
extern "C"
{
#endif
  void EMSCRIPTEN_KEEPALIVE calcPosition(float *nodePos, int *nodeInfo, int nodeNum, int *linkInfo, int linkNum, float *output)
  {
    graph *g = new graph(nodePos, nodeInfo, nodeNum, linkInfo, linkNum);
    float *nodePosition = g->getNodesPosition();
    for (int i = 0; i < nodeNum * 2; i++)
      output[i] = nodePosition[i];
    delete[] nodePosition;
    return;
  }

  void dijsktra(int nodeNum, std::vector<std::vector<Edge>> &edges, int start, std::vector<float> &dist)
  {
    // 优先队列，BFS
    std::priority_queue<Pair, std::vector<Pair>, std::greater<Pair>> queue;
    bool visited[nodeNum];
    memset(visited, false, sizeof(visited));
    // 初始距离不可达
    for (int i = 0; i < nodeNum; i++)
      dist[i] = MAX;
    dist[start] = 0;

    queue.push(std::make_pair(0, start));
    while (!queue.empty())
    {
      Pair current = queue.top();
      queue.pop();
      // 已被访问
      if (visited[current.second])
        continue;
      // 未被访问，遍历邻居节点
      int target = current.second;
      visited[target] = true;
      for (Edge e : edges[target])
      {
        int son = e.target;
        // 若距离更短，则记录该路径
        if (dist[son] > dist[target] + e.weight)
        {
          dist[son] = dist[target] + e.weight;
          if (!visited[son])
            queue.push(std::make_pair(dist[son], son));
        }
      }
    }
  }

  void rkSeed(unsigned long seed, rkState *state)
  {
    int pos;
    seed &= 0xffffffffUL;

    /* Knuth's PRNG as used in the Mersenne Twister reference implementation */
    //  624循环
    for (pos = 0; pos < RK_STATE_LEN; pos++)
    {
      state->key[pos] = seed;
      seed = (1812433253UL * (seed ^ (seed >> 30)) + pos + 1) & 0xffffffffUL;
    }

    state->pos = RK_STATE_LEN;
    state->gauss = 0;
    state->has_gauss = 0;
    state->has_binomial = 0;
  }

  unsigned long rkInterval(unsigned long max, rkState *state)
  {
    unsigned long mask = max, value;
    if (max == 0)
    {
      return 0;
    }
    /* Smallest bit mask >= max */
    mask |= mask >> 1;
    mask |= mask >> 2;
    mask |= mask >> 4;
    mask |= mask >> 8;
    mask |= mask >> 16;
#if ULONG_MAX > 0xffffffffUL
    mask |= mask >> 32;
#endif

    /* Search a random value in [0..mask] <= max */
#if ULONG_MAX > 0xffffffffUL
    if (max <= 0xffffffffUL)
    {
      while ((value = (rkRandom(state) & mask)) > max)
        ;
    }
    else
    {
      while ((value = (rkUlong(state) & mask)) > max)
        ;
    }
#else
  while ((value = (rkUlong(state) & mask)) > max)
    ;
#endif
    return value;
  }

  unsigned long rkUlong(rkState *state)
  {
#if ULONG_MAX <= 0xffffffffUL
    return rkRandom(state);
#else
  return (rkRandom(state) << 32) | (rkRandom(state));
#endif
  }

  unsigned long rkRandom(rkState *state)
  {

    unsigned long y;

    if (state->pos == RK_STATE_LEN)
    {
      int i;

      for (i = 0; i < 624 - 397; i++)
      {
        y = (state->key[i] & 0x80000000UL) | (state->key[i + 1] & 0x7fffffffUL);
        state->key[i] = state->key[i + 397] ^ (y >> 1) ^ (-(y & 1) & 0x9908b0dfUL);
      }
      for (; i < 624 - 1; i++)
      {
        y = (state->key[i] & 0x80000000UL) | (state->key[i + 1] & 0x7fffffffUL);
        state->key[i] = state->key[i + (397 - 624)] ^ (y >> 1) ^ (-(y & 1) & 0x9908b0dfUL);
      }
      y = (state->key[624 - 1] & 0x80000000UL) | (state->key[0] & 0x7fffffffUL);
      state->key[624 - 1] = state->key[397 - 1] ^ (y >> 1) ^ (-(y & 1) & 0x9908b0dfUL);

      state->pos = 0;
    }
    y = state->key[state->pos++];

    /* Tempering */
    y ^= (y >> 11);
    y ^= (y << 7) & 0x9d2c5680UL;
    y ^= (y << 15) & 0xefc60000UL;
    y ^= (y >> 18);

    return y;
  }

  void fisheryatesShuffle(std::vector<constraint> &constraints, rkState &rstate)
  {
    int n = constraints.size();
    for (int i = n - 1; i > 0; i--)
    {
      // 获得[0,i]之间的随机数
      unsigned j = rkInterval(i, &rstate);
      // i为数组末尾，j为随机值，交换两者位置。
      constraint temp = constraints[i];
      constraints[i] = constraints[j];
      constraints[j] = temp;
    }
  }

  graph::graph(float *nodePos, int *nodeInfo, int nodeNum, int *linkInfo, int linkNum)
  {
    this->nodeNum = nodeNum;
    this->linkNum = linkNum;
    this->initLink(linkInfo);
    this->initNode(nodePos, nodeInfo);
    this->calcPinning();
    // this->printNode();
    this->solveDij();
    this->SMLayout();
    // this->printNode();
    // this->printShortPath();
  }

  void graph::initNode(float *nodePos, int *nodeInfo)
  {
    int index;
    for (int i = 0; i < nodeNum; i++)
    {
      index = i * 2;
      // 如果节点位置为非随机，则直接使用上一时间片位置
      if (!nodeInfo[i])
        nodes.emplace_back(Node(edges[i].size(), nodePos[index], nodePos[index + 1], 1));
      // 节点位置随机，根据其连边信息计算
      else
      {
        int deg = edges[i].size();
        if (deg == 0)
        {
          nodes.emplace_back(Node(deg, nodePos[index], nodePos[index + 1], 0));
          continue;
        }
        else
        {
          int confirmNum = 0;
          float tempX = 0.f, tempY = 0.f;
          for (Edge e : edges[i])
          {
            int target = e.target;
            if (!nodeInfo[target])
            {
              confirmNum++;
              tempX += nodePos[target * 2];
              tempY += nodePos[target * 2 + 1];
            }
          }
          switch (confirmNum)
          {
          case 0: // 无确定位置邻居,采取随机位置
            nodes.emplace_back(Node(deg, nodePos[index], nodePos[index + 1], 0));
            break;
          case 1: // 单个确定位置邻居，随机位置与布局中心的中心点
            nodes.emplace_back(Node(deg, tempX / 2, tempY / 2, 0.1));
            break;
          default: // 多个确定位置邻居，邻居节点位置中心
            nodes.emplace_back(Node(deg, tempX / confirmNum, tempY / confirmNum, 0.25));
            break;
          }
        }
      }
    }
    return;
  }

  void graph::initLink(int *linkInfo)
  {
    // 集合去除重复边
    std::vector<std::set<int>> undirected(nodeNum);
    edges.resize(nodeNum);
    int index = 0;
    int source, target;
    for (int i = 0; i < linkNum; i++)
    {
      index = i * 2;
      source = linkInfo[index];
      target = linkInfo[index + 1];
      if (undirected[source].find(target) != undirected[source].end())
        continue;
      undirected[source].insert(target);
      undirected[target].insert(source);

      links.emplace_back(Link(source, target));

      Edge tmp;
      tmp.weight = DEFAULT_WEIGHT;
      tmp.target = target;
      edges[source].emplace_back(tmp);
      tmp.weight = DEFAULT_WEIGHT;
      tmp.target = source;
      edges[target].emplace_back(tmp);
    }
    return;
  }

  float *graph::getNodesPosition()
  {
    float *nodePosition = new float[nodeNum * 2];
    for (int i = 0; i < nodeNum; i++)
    {
      int index = i * 2;
      nodePosition[index] = nodes[i].x;
      nodePosition[index + 1] = nodes[i].y;
    }
    return nodePosition;
  }

  void graph::calcPinning(float alpha, float initial, float k)
  {
    updateLocalPinning(alpha);
    updateGlobalPinning(initial, k);
    updateMobilityByPinning();
  }

  // 局部固定值计算，alpha为局部特征参数
  void graph::updateLocalPinning(float alpha)
  {
    if (alpha == 1.f)
    {
      for (int i = 0; i < nodeNum; i++)
        nodes[i].pinning = nodes[i].confidence;
      return;
    }

    for (int i = 0; i < nodeNum; i++)
    {
      float confidence = nodes[i].confidence;
      float sum = 0;
      for (Edge e : edges[i])
        sum += nodes[e.target].confidence;
      float pinning = alpha * confidence + (1 - alpha) * sum / (edges[i].size());
      if (pinning < 1)
        lowPinning.emplace_back(i);
      nodes[i].pinning = pinning;
    }
  }
  // 全局固定值计算，initial为初始值，k为影响范围
  void graph::updateGlobalPinning(float initial, float k)
  {
    if (lowPinning.size() == 0 || k > 1)
      return;
    bool visited[nodeNum];
    memset(visited, false, sizeof(visited));
    std::vector<std::vector<int>> nodeRange;

    for (int i : lowPinning)
      visited[i] = true;

    nodeRange.emplace_back(lowPinning);
    int range = 0, nodeSum = lowPinning.size();
    while (nodeSum != nodeNum)
    {
      std::vector<int> curRange;
      for (int i : nodeRange[range])
      {
        for (Edge e : edges[i])
        {
          int target = e.target;
          if (visited[target])
            continue;
          curRange.emplace_back(target);
          visited[target] = true;
          nodeSum++;
        }
      }
      nodeRange.emplace_back(curRange);
      range++;
    }

    float limitRange = range * k;
    for (int i = 0; i < limitRange; i++)
    {
      float pinning = pow(initial, 1 - i / limitRange);
      for (int i : nodeRange[i])
        nodes[i].pinning = pinning;
    }
  }

  void graph::updateMobilityByPinning()
  {
    for (int i = 0; i < nodeNum; i++)
      nodes[i].mobility = 1 - nodes[i].pinning;
  }

  void graph::solveDij()
  {
    for (int i = 0; i < nodeNum; i++)
    {
      std::vector<float> dist(nodeNum);
      dijsktra(nodeNum, edges, i, dist);
      std::vector<float> sp(nodeNum);

      for (int j = 0; j < nodeNum; j++)
        sp[j] = dist[j] == MAX ? 0 : dist[j];
      shortPath.emplace_back(sp);
    }
  }

  void graph::appendNodeRange(parameter &para)
  {
    for (int i = 0; i < nodeNum; i++)
    {
      // 力的作用是相互的，仅需一半的节点对存在力作用
      for (int j = 0; j < nodeNum; j++)
      {
        if (nodes[i].mobility == 0.f && nodes[j].mobility == 0.f)
          continue;
        float weight = shortPath[i][j] == 0 ? 0 : 1 / (shortPath[i][j] * shortPath[i][j]);
        constraints.emplace_back(constraint(i, j, shortPath[i][j], weight, para));
      }
    }
  }

  void graph::preSolveSGD(float stepMin, int iterMax, int seed, float stepMax)
  {
    rkSeed(seed, &rstate);
    fisheryatesShuffle(constraints, rstate);

    float lambd = log(stepMin / stepMax) / (iterMax - 1);
    for (int i = 0; i < iterMax; i++)
      stepLength.push_back(stepMax * exp(lambd * i));
  }

  void graph::SMLayout()
  {
    int iterMax = 30;
    parameter para(2, 1, -2, -2, 0, 1);
    appendNodeRange(para);

    preSolveSGD(0.01, iterMax, 42);
    for (int iter = 0; iter < iterMax; iter++)
      solveSGD(iter);
  }

  bool graph::solveSGD(int iter)
  {
    // 每10轮，打乱一次约束顺序
    if (iter % 10 == 1)
      fisheryatesShuffle(constraints, rstate);
    for (constraint curConstraint : constraints)
    {
      const float &ka = curConstraint.para.w1;
      const float &kr = curConstraint.para.w2;
      const float &alpha1 = curConstraint.para.a1;
      const float &alpha2 = curConstraint.para.a2;
      const float &beta1 = curConstraint.para.b1;
      const float &beta2 = curConstraint.para.b2;
      const int &i = curConstraint.i;
      const int &j = curConstraint.j;
      const float &weight = curConstraint.weight;
      const float &dij = curConstraint.dij;

      float step = stepLength[iter];
      float mvx = nodes[i].x - nodes[j].x, mvy = nodes[i].y - nodes[j].y;
      float dist = sqrtf(mvx * mvx + mvy * mvy);
      if (dist < 0.1f)
        dist = 0.1f;
      float distRec = 1. / dist, dijRec = 1. / dij;

      float fa = ka;
      {
        if (ka != 0)
        {
          if (alpha1 - int(alpha1) == 0.f)
          {
            if (alpha1 > 0)
              for (int i = 0; i < alpha1; i++)
                fa *= dist;
            else if (alpha1 < 0)
              for (int i = 0; i < -alpha1; i++)
                fa *= distRec;
          }
          else
            fa *= pow(dist, alpha1);
          if (beta1 - int(beta1) == 0.f)
          {
            if (beta1 > 0)
              for (int i = 0; i < beta1; i++)
                fa *= dij;
            else if (beta1 < 0)
              for (int i = 0; i < -beta1; i++)
                fa *= dijRec;
          }
          else
            fa *= pow(dij, beta1);
        }
      }

      float fr = kr;
      {
        if (kr != 0)
        {
          if (alpha2 - int(alpha2) == 0.f)
          {
            if (alpha2 > 0)
              for (int i = 0; i < alpha2; i++)
                fr *= dist;
            else if (alpha2 < 0)
              for (int i = 0; i < -alpha2; i++)
                fr *= distRec;
          }
          else
            fr *= pow(dist, alpha2);
          if (beta2 - int(beta2) == 0.f)
          {
            if (beta2 > 0)
              for (int i = 0; i < beta2; i++)
                fr *= dij;
            else if (beta2 < 0)
              for (int i = 0; i < -beta2; i++)
                fr *= dijRec;
          }
          else
            fr *= pow(dij, beta2);
        }
      }

      float force = step * (fa + fr);
      // 当仅有单个力作用时，力过大会导致布局影响较大，需要限制力
      if (ka == 0 || kr == 0)
        force = abs(force) > dist ? dist : force;
      else
        force = abs(force) > abs(dist - dij) ? dist - dij : force;

      float rx = mvx / dist * force;
      float ry = mvy / dist * force;

      nodes[i].x -= rx * nodes[i].mobility;
      nodes[i].y -= ry * nodes[i].mobility;
      nodes[j].x += rx * nodes[j].mobility;
      nodes[j].y += ry * nodes[j].mobility;
    }
    return true;
  }

  void graph::printNode()
  {
    printf("%-10s\t%-10s\t%-10s\t%-10s\t%-10s\n", "index", "x", "y", "deg", "mobility");
    for (int i = 0; i < nodeNum; i++)
      printf("%-10d\t%-10.2f\t%-10.2f\t%-10d\t%-10.2f\n", i, nodes[i].x, nodes[i].y, nodes[i].deg, nodes[i].mobility);
  }

  void graph::printEdge()
  {
    for (int i = 0; i < nodeNum; i++)
    {
      printf("%d", i);
      for (int j = 0; j < edges[i].size(); j++)
        printf("\t%d", edges[i][j].target);
      printf("\n");
    }
  }

  void graph::printShortPath()
  {
    for (int i = 0; i < nodeNum; i++)
    {
      for (int j = 0; j < nodeNum; j++)
        printf("%.1f\t", shortPath[i][j]);
      printf("\n");
    }
  }
#ifdef __cplusplus
}
#endif
