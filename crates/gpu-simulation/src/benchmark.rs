    /// Run the benchmark
    fn run(&self, simulator: &mut GPUSimulator) -> KernelResult {
        launch_kernel(simulator, self.config.clone(), |ctx| {
            // Simulate some work
            let num_warps = ctx.blocks().len();
            for warp_idx in 0..num_warps {
                for _ in 0..1000 {
                    ctx.record_instruction();
                    ctx.global_read(0, 4, warp_idx);
                }
            }
            Ok(())
        }).unwrap()
    }