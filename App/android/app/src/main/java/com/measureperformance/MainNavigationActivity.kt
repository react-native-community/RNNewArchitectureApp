package com.measureperformance

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.measureperformance.databinding.ActivityMainNavigationBinding
import com.facebook.react.ReactFragment
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

class MainNavigationActivity : AppCompatActivity() , DefaultHardwareBackBtnHandler {

    private lateinit var binding: ActivityMainNavigationBinding
    private lateinit var oldArchitectureFragment: ReactFragment
    private lateinit var newArchitectureFragment: ReactFragment
    private val mainComponentName = "MeasurePerformance"


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainNavigationBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        binding.toolbar.title = getString(R.string.title_activity_main_navigation)
        oldArchitectureFragment = ReactFragment.Builder()
                .setComponentName(mainComponentName)
                .setFabricEnabled(false)
                .build()
        newArchitectureFragment = ReactFragment.Builder()
                .setComponentName(mainComponentName)
                .setFabricEnabled(true)
                .build()
        binding.bottomNavigationView.setOnItemSelectedListener {
            when (it.itemId) {
                R.id.nv_old_architecture -> {
                    displayFragment(oldArchitectureFragment)
                    return@setOnItemSelectedListener true
                }
                R.id.nv_new_architecture -> {
                    displayFragment(newArchitectureFragment)
                    return@setOnItemSelectedListener true
                }
            }
            return@setOnItemSelectedListener false
        }
        binding.bottomNavigationView.selectedItemId = R.id.nv_old_architecture
    }

    @SuppressLint("CommitTransaction")
    private fun displayFragment(fragment: Fragment) = supportFragmentManager
            .beginTransaction()
            .replace(R.id.nav_host_fragment_content_main_navigation, fragment)
            .commit()
    
    override fun invokeDefaultOnBackPressed() {
        super.onBackPressed()
    }
}
