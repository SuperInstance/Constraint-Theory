//! GPU Simulation Framework Benchmarks
//!
//! Criterion benchmarks for the GPU simulation framework.

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use gpu_simulation::{
    GPUSimulator, KernelConfig, launch_kernel,
    BenchmarkSuite, Benchmark, ConstraintTheoryScenario,
};

fn bench_kernel_launch(c: &mut Criterion) {
    let mut sim = GPUSimulator::rtx_4090();

    c.bench_function("kernel_launch", |b| {
        b.iter(|| {
            let config = KernelConfig::new(256, 10);
            launch_kernel(black_box(&mut sim), config, |ctx| {
                for block in ctx.blocks_mut() {
                    for warp_idx in 0..block.warps.len().min(8) {
                        ctx.global_read(warp_idx * 64, 64, warp_idx);
                        for _ in 0..100 {
                            ctx.record_instruction();
                        }
                        ctx.global_write(warp_idx * 64, 64, warp_idx);
                    }
                }
                Ok(())
            }).unwrap()
        })
    });
}

fn bench_kdtree_simulation(c: &mut Criterion) {
    let mut group = c.benchmark_group("kdtree_simulation");

    for num_queries in [1000, 10000, 100000].iter() {
        let mut sim = GPUSimulator::rtx_4090();
        let threads = 256.min(*num_queries);
        let blocks = (*num_queries + threads - 1) / threads;
        let config = KernelConfig::new(threads, blocks)
            .with_name("kdtree_search")
            .with_shared_memory(32 * 1024);

        group.bench_with_input(
            BenchmarkId::from_parameter(num_queries),
            num_queries,
            |b, &_num_queries| {
                b.iter(|| {
                    launch_kernel(black_box(&mut sim), config.clone(), |ctx| {
                        let tree_depth = 17; // ~100K points

                        for block in ctx.blocks_mut() {
                            for warp_idx in 0..block.warps.len() {
                                for _ in 0..256.min(*num_queries) {
                                    for depth in 0..tree_depth {
                                        ctx.global_read(depth * 4, 4, warp_idx);
                                        ctx.record_instruction();
                                    }
                                    ctx.global_read(tree_depth * 4, 16, warp_idx);
                                    ctx.record_instruction();
                                }
                            }
                        }

                        Ok(())
                    }).unwrap()
                })
            },
        );
    }

    group.finish();
}

fn bench_pythagorean_snap(c: &mut Criterion) {
    let mut group = c.benchmark_group("pythagorean_snap");

    for num_points in [1000, 10000, 100000].iter() {
        let mut sim = GPUSimulator::rtx_4090();
        let threads = 256.min(*num_points);
        let blocks = (*num_points + threads - 1) / threads;
        let config = KernelConfig::new(threads, blocks)
            .with_name("pythagorean_snap")
            .with_shared_memory(16 * 1024);

        group.bench_with_input(
            BenchmarkId::from_parameter(num_points),
            num_points,
            |b, &_num_points| {
                b.iter(|| {
                    launch_kernel(black_box(&mut sim), config.clone(), |ctx| {
                        for block in ctx.blocks_mut() {
                            for warp_idx in 0..block.warps.len() {
                                for point_idx in 0..num_points.min(256) {
                                    ctx.global_read(point_idx * 8, 8, warp_idx);
                                    ctx.record_instruction();

                                    let num_triples = 10_000;
                                    let chunk_size = 256;

                                    for chunk_start in (0..num_triples).step_by(chunk_size) {
                                        for i in 0..chunk_size.min(num_triples - chunk_start) {
                                            ctx.shared_access(i * 12, 12);
                                            ctx.record_instruction();
                                        }
                                    }

                                    ctx.record_instruction();
                                }
                            }
                        }

                        Ok(())
                    }).unwrap()
                })
            },
        );
    }

    group.finish();
}

fn bench_holonomy_transport(c: &mut Criterion) {
    let mut group = c.benchmark_group("holonomy_transport");

    for num_vectors in [1000, 10000, 100000].iter() {
        let mut sim = GPUSimulator::rtx_4090();
        let threads = 256.min(*num_vectors);
        let blocks = (*num_vectors + threads - 1) / threads;
        let config = KernelConfig::new(threads, blocks)
            .with_name("holonomy_transport")
            .with_shared_memory(8 * 1024);

        group.bench_with_input(
            BenchmarkId::from_parameter(num_vectors),
            num_vectors,
            |b, &_num_vectors| {
                b.iter(|| {
                    launch_kernel(black_box(&mut sim), config.clone(), |ctx| {
                        let path_length = 100;

                        for block in ctx.blocks_mut() {
                            for warp_idx in 0..block.warps.len() {
                                for vec_idx in 0..num_vectors.min(256) {
                                    ctx.global_read(vec_idx * 12, 12, warp_idx);
                                    ctx.record_instruction();

                                    for _ in 0..path_length {
                                        ctx.global_read(0, 36, warp_idx);
                                        ctx.record_instruction();
                                        ctx.record_instruction();
                                        ctx.record_instruction();
                                        ctx.record_instruction();
                                    }

                                    ctx.record_instruction();
                                }
                            }
                        }

                        Ok(())
                    }).unwrap()
                })
            },
        );
    }

    group.finish();
}

fn bench_memory_hierarchy(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_hierarchy");

    for memory_type in ["global", "shared", "register"].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(memory_type),
            memory_type,
            |b, &_memory_type| {
                b.iter(|| {
                    let mut sim = GPUSimulator::rtx_4090();
                    let config = KernelConfig::new(256, 10);

                    launch_kernel(black_box(&mut sim), config, |ctx| {
                        for block in ctx.blocks_mut() {
                            for warp_idx in 0..block.warps.len() {
                                for _ in 0..1000 {
                                    match *memory_type {
                                        "global" => {
                                            ctx.global_read(0, 4, warp_idx);
                                        }
                                        "shared" => {
                                            ctx.shared_access(0, 4);
                                        }
                                        "register" => {
                                            ctx.record_instruction();
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }

                        Ok(())
                    }).unwrap()
                })
            },
        );
    }

    group.finish();
}

fn bench_benchmark_suite(c: &mut Criterion) {
    c.bench_function("benchmark_suite", |b| {
        b.iter(|| {
            let mut sim = GPUSimulator::rtx_4090();
            let mut suite = BenchmarkSuite::new("test_suite");

            let config = KernelConfig::new(256, 10);
            suite.add_benchmark(Benchmark::new("test_benchmark", config));

            suite.run(black_box(&mut sim));
        })
    });
}

criterion_group!(
    benches,
    bench_kernel_launch,
    bench_kdtree_simulation,
    bench_pythagorean_snap,
    bench_holonomy_transport,
    bench_memory_hierarchy,
    bench_benchmark_suite
);

criterion_main!(benches);
