#include <stddef.h>
#include <string.h>

#include <cmath>
#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <vector>

#define DEFAULT_WEIGHT 1
#define Pair std::pair<int, int>
#define MAX 200000

#define RK_STATE_LEN 624
/* Maximum generated random value */
#define RK_MAX 0xFFFFFFFFUL

typedef struct rk_state_ {
  // key 存放随机数
  unsigned long key[RK_STATE_LEN];
  int pos;
  int has_gauss; /* !=0: gauss contains a gaussian deviate */
  double gauss;

  /* The rk_state structure has been extended to store the following
   * information for the binomial generator. If the input values of n or p
   * are different than nsave and psave, then the other parameters will be
   * recomputed. RTK 2005-09-02 */

  int has_binomial; /* !=0: following parameters initialized for
                            binomial */
  double psave;
  long nsave;
  double r;
  double q;
  double fm;
  long m;
  double p1;
  double xm;
  double xl;
  double xr;
  double c;
  double laml;
  double lamr;
  double p2;
  double p3;
  double p4;

} rkState;

typedef enum {
  RK_NOERR = 0,  /* no error */
  RK_ENODEV = 1, /* no RK_DEV_RANDOM device */
  RK_ERR_MAX = 2
} rkError;

/* error strings */
extern char *rk_strerror[RK_ERR_MAX];

struct Node {
  int deg;
  float x, y;
  float confidence, pinning;
  float mobility;

  Node() : deg(0), x(0), y(0), mobility(1){};
  Node(int d, float x, float y) : deg(d), x(x), y(y), mobility(1){};
  Node(int d, float x, float y, float confidence)
      : deg(d), x(x), y(y), confidence(confidence), mobility(1){};

  friend bool operator>(const Node &n1, const Node &n2) {
    return n1.deg > n2.deg;
  }
};

struct Link {
  int source, target;

  Link() : source(-1), target(-1){};

  Link(int s, int t) : source(s), target(t){};

  friend bool operator>(const Link &l1, const Link &l2) {
    if (l1.source != l2.source)
      return l1.source > l2.source;
    else
      return l1.target > l2.target;
  }
};

struct Edge {
  int weight, target;
};

struct parameter {
  // 系数，实际距离次幂，理想距离次幂。
  float w1, a1, b1, w2, a2, b2;

  parameter() : w1(0), a1(0), b1(0), w2(0), a2(0), b2(0){};

  parameter(float w1, float a1, float b1, float w2, float a2, float b2)
      : w1(w1), a1(a1), b1(b1), w2(w2), a2(a2), b2(b2){};
};

struct constraint {
  int i, j;
  float dij, weight;
  parameter para;

  constraint(){};

  constraint(int i, int j, float dij, float w, parameter pa)
      : i(i), j(j), dij(dij), weight(w), para(pa){};
};

class graph {
 private:
  int nodeNum, linkNum;
  std::vector<Node> nodes;
  std::vector<Link> links;
  std::vector<std::vector<Edge>> edges;
  std::vector<std::vector<float>> shortPath;
  std::vector<int> lowPinning;
  std::vector<constraint> constraints;
  std::vector<float> stepLength;
  rkState rstate;

  void updateLocalPinning(float alpha);
  void updateGlobalPinning(float initial, float k);
  void updateMobilityByPinning();
  void solveDij();
  void appendNodeRange(parameter &para);
  void preSolveSGD(float stepMin = 0.1, int iterMax = 200, int seed = 42,
                   float stepMax = 100.);
  bool solveSGD(int iter);

 public:
  void initNode(float *nodePos, int *nodeInfo);
  void initLink(int *linkInfo);
  void initNodePosition(float *nodePos);
  void calcPinning(float alpha = 0.6, float initial = 0.65, float k = 0.5);
  void printNode();
  void printEdge();
  void printShortPath();
  void SMLayout();
  float *getNodesPosition();

  graph() : nodeNum(0), linkNum(0){};
  graph(float *nodePos, int *nodeInfo, int nodeNum, int *linkInfo, int linkNum);
};

extern "C" void dijsktra(int nodeNum, std::vector<std::vector<Edge>> &edges,
                         int start, std::vector<float> &dist);

extern "C" void fisheryatesShuffle(std::vector<constraint> &constraints,
                                   rkState &rstate);

extern "C" void rkSeed(unsigned long seed, rkState *state);

/*
 * Initialize the RNG state using a random seed.
 * Uses /dev/random or, when unavailable, the clock (see randomkit.c).
 * Returns RK_NOERR when no errors occurs.
 * Returns RK_ENODEV when the use of RK_DEV_RANDOM failed (for example because
 * there is no such device). In this case, the RNG was initialized using the
 * clock.
 */
// // extern rk_error rk_randomseed(rk_state *state);

/*
 * Returns a random unsigned long between 0 and RK_MAX inclusive
 */
extern "C" unsigned long rkRandom(rkState *state);

// /*
//  * Returns a random long between 0 and LONG_MAX inclusive
//  */
// extern "C" long rk_long(rk_state *state);

/*
 * Returns a random unsigned long between 0 and ULONG_MAX inclusive
 */
extern "C" unsigned long rkUlong(rkState *state);

/*
 * Returns a random unsigned long between 0 and max inclusive.
 */
extern "C" unsigned long rkInterval(unsigned long max, rkState *state);

// /*
//  * Returns a random double between 0.0 and 1.0, 1.0 excluded.
//  */
// extern "C" double rk_double(rk_state *state);