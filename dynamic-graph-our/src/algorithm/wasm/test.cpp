#include <emscripten.h>
#include <stdio.h>

extern "C"
{
  void EMSCRIPTEN_KEEPALIVE calcPosition(float *node_pos, int *node_info, int node_num, int *link_info, int link_num, float *output)
  {
    return;
  }

  void EMSCRIPTEN_KEEPALIVE Hello()
  {
    printf("Hello world!\n");
  }

  void EMSCRIPTEN_KEEPALIVE addOne(int *input_ptr, int *output_ptr, int len)
  {
    int i;
    for (i = 0; i < len; i++)
      output_ptr[i] = input_ptr[i] + 1;
  }
}
